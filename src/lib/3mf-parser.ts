import JSZip from 'jszip';
import { parseString as parseXML } from 'xml2js';
import { logger } from './logger';

/**
 * Interface for parsed 3MF metadata matching the SlicedFile database schema
 */
export interface Parsed3MFMetadata {
  // Basic print information
  printTimeMinutes?: number;
  totalTimeMinutes?: number;
  layerCount?: number;
  layerHeight?: number;
  maxZHeight?: number;
  
  // Slicer information
  slicerName?: string;
  slicerVersion?: string;
  profileName?: string;
  
  // Printer settings
  nozzleDiameter?: number;
  bedType?: string;
  bedTemperature?: number;
  
  // Filament totals (aggregated across all filaments)
  totalFilamentLength?: number;
  totalFilamentVolume?: number;
  totalFilamentWeight?: number;
  
  // Per-filament data for SlicedFileFilament junction table
  filaments: Array<{
    filamentIndex: number;
    // Total usage
    lengthUsed?: number;
    volumeUsed?: number;
    weightUsed?: number;
    
    // Usage breakdown by purpose (when available)
    modelLength?: number;
    modelVolume?: number;
    modelWeight?: number;
    supportLength?: number;
    supportVolume?: number;
    supportWeight?: number;
    towerLength?: number;
    towerVolume?: number;
    towerWeight?: number;
    wasteLength?: number;
    wasteVolume?: number;
    wasteWeight?: number;
    infillLength?: number;
    infillVolume?: number;
    infillWeight?: number;
    wallLength?: number;
    wallVolume?: number;
    wallWeight?: number;
    
    // Filament properties
    filamentType?: string;
    filamentColor?: string;
    filamentVendor?: string;
    density?: number;
    diameter?: number;
    nozzleTemp?: number;
    bedTemp?: number;
  }>;
}

/**
 * Parse time string like "29m 54s" to minutes as decimal
 */
export function parseTimeToMinutes(timeString: string): number | undefined {
  try {
    const timeRegex = /(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?/;
    const match = timeString.match(timeRegex);
    
    if (!match) return undefined;
    
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    
    return hours * 60 + minutes + seconds / 60;
  } catch (error) {
    logger.error('Failed to parse time string:', { timeString, error });
    return undefined;
  }
}

/**
 * Parse comma-separated float values like "3418.34,114.26"
 */
export function parseCommaSeparatedFloats(value: string): number[] {
  try {
    return value.split(',')
      .map(str => str.trim())
      .filter(str => str.length > 0)
      .map(str => parseFloat(str))
      .filter(num => !isNaN(num));
  } catch (error) {
    logger.error('Failed to parse comma-separated floats:', { value, error });
    return [];
  }
}

/**
 * Parse color list like "#00AE42;#FFFF00" or ["#00AE42","#FFFF00"]
 */
export function parseColorList(colorString: string | string[]): string[] {
  try {
    if (Array.isArray(colorString)) {
      return colorString;
    }
    return colorString.split(';')
      .map(color => color.trim())
      .filter(color => color.length > 0);
  } catch (error) {
    logger.error('Failed to parse color list:', { colorString, error });
    return [];
  }
}

/**
 * Parse slicer info from header line like "BambuStudio 02.01.01.52"
 */
export function parseSlicerInfo(headerLine: string): { name?: string; version?: string } {
  try {
    // Remove comment prefix and trim
    const line = headerLine.replace(/^;\s*/, '').trim();
    
    // Match pattern: "SlicerName Version"
    const match = line.match(/^([A-Za-z\s]+)\s+([0-9\.]+(?:\.[0-9]+)*)$/);
    
    if (match) {
      return {
        name: match[1].trim(),
        version: match[2].trim()
      };
    }
    
    // Fallback: treat entire line as slicer name
    return { name: line };
  } catch (error) {
    logger.error('Failed to parse slicer info:', { headerLine, error });
    return {};
  }
}

/**
 * Parse gcode header block (lines between HEADER_BLOCK_START and HEADER_BLOCK_END)
 */
function parseGcodeHeader(gcodeContent: string): Partial<Parsed3MFMetadata> {
  const result: Partial<Parsed3MFMetadata> = { filaments: [] };
  
  try {
    const lines = gcodeContent.split('\n');
    let inHeaderBlock = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.includes('HEADER_BLOCK_START')) {
        inHeaderBlock = true;
        continue;
      }
      
      if (trimmedLine.includes('HEADER_BLOCK_END')) {
        break;
      }
      
      if (!inHeaderBlock || !trimmedLine.startsWith(';')) {
        continue;
      }
      
      // Parse slicer info from first non-marker comment line
      if (!result.slicerName && trimmedLine.match(/^;\s*[A-Za-z]/)) {
        const slicerInfo = parseSlicerInfo(trimmedLine);
        result.slicerName = slicerInfo.name;
        result.slicerVersion = slicerInfo.version;
        continue;
      }
      
      // Parse specific metadata fields
      if (trimmedLine.includes('model printing time:')) {
        const timeMatch = trimmedLine.match(/model printing time:\s*([^;]+)/);
        if (timeMatch) {
          result.printTimeMinutes = parseTimeToMinutes(timeMatch[1].trim());
        }
      }
      
      if (trimmedLine.includes('total estimated time:')) {
        const timeMatch = trimmedLine.match(/total estimated time:\s*([^;]*)/);
        if (timeMatch) {
          result.totalTimeMinutes = parseTimeToMinutes(timeMatch[1].trim());
        }
      }
      
      if (trimmedLine.includes('total layer number:')) {
        const layerMatch = trimmedLine.match(/total layer number:\s*(\d+)/);
        if (layerMatch) {
          result.layerCount = parseInt(layerMatch[1], 10);
        }
      }
      
      if (trimmedLine.includes('max_z_height:')) {
        const heightMatch = trimmedLine.match(/max_z_height:\s*([\d\.]+)/);
        if (heightMatch) {
          result.maxZHeight = parseFloat(heightMatch[1]);
        }
      }
      
      // Parse multi-filament data
      if (trimmedLine.includes('total filament length [mm]')) {
        const lengthMatch = trimmedLine.match(/total filament length \[mm\]\s*:\s*([\d\.,]+)/);
        if (lengthMatch) {
          const lengths = parseCommaSeparatedFloats(lengthMatch[1]);
          result.totalFilamentLength = lengths.reduce((sum, len) => sum + len, 0);
          lengths.forEach((length, index) => {
            if (!result.filaments![index]) result.filaments![index] = { filamentIndex: index };
            result.filaments![index].lengthUsed = length;
          });
        }
      }
      
      if (trimmedLine.includes('total filament volume [cm^3]')) {
        const volumeMatch = trimmedLine.match(/total filament volume \[cm\^3\]\s*:\s*([\d\.,]+)/);
        if (volumeMatch) {
          const volumes = parseCommaSeparatedFloats(volumeMatch[1]);
          result.totalFilamentVolume = volumes.reduce((sum, vol) => sum + vol, 0);
          volumes.forEach((volume, index) => {
            if (!result.filaments![index]) result.filaments![index] = { filamentIndex: index };
            result.filaments![index].volumeUsed = volume;
          });
        }
      }
      
      if (trimmedLine.includes('total filament weight [g]')) {
        const weightMatch = trimmedLine.match(/total filament weight \[g\]\s*:\s*([\d\.,]+)/);
        if (weightMatch) {
          const weights = parseCommaSeparatedFloats(weightMatch[1]);
          result.totalFilamentWeight = weights.reduce((sum, weight) => sum + weight, 0);
          weights.forEach((weight, index) => {
            if (!result.filaments![index]) result.filaments![index] = { filamentIndex: index };
            result.filaments![index].weightUsed = weight;
          });
        }
      }
      
      if (trimmedLine.includes('filament_density:')) {
        const densityMatch = trimmedLine.match(/filament_density:\s*([\d\.,]+)/);
        if (densityMatch) {
          const densities = parseCommaSeparatedFloats(densityMatch[1]);
          densities.forEach((density, index) => {
            if (!result.filaments![index]) result.filaments![index] = { filamentIndex: index };
            result.filaments![index].density = density;
          });
        }
      }
      
      if (trimmedLine.includes('filament_diameter:')) {
        const diameterMatch = trimmedLine.match(/filament_diameter:\s*([\d\.,]+)/);
        if (diameterMatch) {
          const diameters = parseCommaSeparatedFloats(diameterMatch[1]);
          diameters.forEach((diameter, index) => {
            if (!result.filaments![index]) result.filaments![index] = { filamentIndex: index };
            result.filaments![index].diameter = diameter;
          });
        }
      }
    }
  } catch (error) {
    logger.error('Failed to parse gcode header:', error);
  }
  
  return result;
}

/**
 * Parse gcode config block for additional metadata
 */
function parseGcodeConfig(gcodeContent: string): Partial<Parsed3MFMetadata> {
  const result: Partial<Parsed3MFMetadata> = { filaments: [] };
  
  try {
    const lines = gcodeContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine.startsWith(';')) continue;
      
      // Parse layer height
      if (trimmedLine.includes('layer_height = ')) {
        const match = trimmedLine.match(/layer_height = ([\d\.]+)/);
        if (match) {
          result.layerHeight = parseFloat(match[1]);
        }
      }
      
      // Parse filament colors
      if (trimmedLine.includes('filament_colour = ')) {
        const match = trimmedLine.match(/filament_colour = (.+)/);
        if (match) {
          const colors = parseColorList(match[1]);
          colors.forEach((color, index) => {
            if (!result.filaments![index]) result.filaments![index] = { filamentIndex: index };
            result.filaments![index].filamentColor = color;
          });
        }
      }
      
      // Parse filament types
      if (trimmedLine.includes('filament_type = ')) {
        const match = trimmedLine.match(/filament_type = (.+)/);
        if (match) {
          const types = match[1].split(';').map(type => type.trim());
          types.forEach((type, index) => {
            if (!result.filaments![index]) result.filaments![index] = { filamentIndex: index };
            result.filaments![index].filamentType = type;
          });
        }
      }
      
      // Parse filament vendors (remove quotes)
      if (trimmedLine.includes('filament_vendor = ')) {
        const match = trimmedLine.match(/filament_vendor = (.+)/);
        if (match) {
          const vendors = match[1].split(';').map(vendor => vendor.trim().replace(/"/g, ''));
          vendors.forEach((vendor, index) => {
            if (!result.filaments![index]) result.filaments![index] = { filamentIndex: index };
            result.filaments![index].filamentVendor = vendor;
          });
        }
      }
      
      // Parse bed temperature
      if (trimmedLine.includes('bed_temperature = ')) {
        const match = trimmedLine.match(/bed_temperature = (\d+)/);
        if (match) {
          result.bedTemperature = parseInt(match[1], 10);
        }
      }
    }
  } catch (error) {
    logger.error('Failed to parse gcode config:', error);
  }
  
  return result;
}

/**
 * Parse JSON metadata file (plate_1.json)
 */
function parseJSONMetadata(jsonContent: string): Partial<Parsed3MFMetadata> {
  const result: Partial<Parsed3MFMetadata> = { filaments: [] };
  
  try {
    const data = JSON.parse(jsonContent);
    
    if (data.bed_type) {
      result.bedType = data.bed_type;
    }
    
    if (data.nozzle_diameter && typeof data.nozzle_diameter === 'number') {
      result.nozzleDiameter = Math.round(data.nozzle_diameter * 100) / 100; // Round to 2 decimal places
    }
    
    if (data.layer_height && typeof data.layer_height === 'number') {
      result.layerHeight = data.layer_height;
    }
    
    // Parse filament colors from JSON
    if (data.filament_colors && Array.isArray(data.filament_colors)) {
      data.filament_colors.forEach((color: string, index: number) => {
        if (!result.filaments![index]) result.filaments![index] = { filamentIndex: index };
        result.filaments![index].filamentColor = color;
      });
    }
  } catch (error) {
    logger.error('Failed to parse JSON metadata:', error);
  }
  
  return result;
}

/**
 * Merge multiple partial metadata objects into a single result
 */
function mergeMetadata(...partials: Partial<Parsed3MFMetadata>[]): Parsed3MFMetadata {
  const result: Parsed3MFMetadata = { filaments: [] };
  
  // Merge all non-filament fields
  for (const partial of partials) {
    Object.keys(partial).forEach(key => {
      if (key !== 'filaments' && partial[key as keyof Parsed3MFMetadata] != null) {
        (result as any)[key] = partial[key as keyof Parsed3MFMetadata];
      }
    });
  }
  
  // Merge filament arrays
  const filamentMap = new Map<number, any>();
  
  for (const partial of partials) {
    if (partial.filaments) {
      for (const filament of partial.filaments) {
        const existing = filamentMap.get(filament.filamentIndex) || { filamentIndex: filament.filamentIndex };
        filamentMap.set(filament.filamentIndex, { ...existing, ...filament });
      }
    }
  }
  
  result.filaments = Array.from(filamentMap.values()).sort((a, b) => a.filamentIndex - b.filamentIndex);
  
  return result;
}


/**
 * Main function to parse 3MF file buffer and extract metadata
 */
export async function parse3MFMetadata(buffer: Buffer): Promise<Parsed3MFMetadata> {
  try {
    logger.info('Starting 3MF metadata parsing');
    
    // Load ZIP archive
    const zip = await JSZip.loadAsync(buffer);
    
    // Extract gcode file (plate_1.gcode)
    const gcodeFile = zip.file('Metadata/plate_1.gcode');
    let headerMetadata: Partial<Parsed3MFMetadata> = { filaments: [] };
    let configMetadata: Partial<Parsed3MFMetadata> = { filaments: [] };
    
    if (gcodeFile) {
      const gcodeContent = await gcodeFile.async('string');
      headerMetadata = parseGcodeHeader(gcodeContent);
      configMetadata = parseGcodeConfig(gcodeContent);
    } else {
      logger.warn('No gcode file found in 3MF archive');
    }
    
    // Extract JSON metadata (plate_1.json)
    const jsonFile = zip.file('Metadata/plate_1.json');
    let jsonMetadata: Partial<Parsed3MFMetadata> = { filaments: [] };
    
    if (jsonFile) {
      const jsonContent = await jsonFile.async('string');
      jsonMetadata = parseJSONMetadata(jsonContent);
    } else {
      logger.warn('No JSON metadata file found in 3MF archive');
    }
    
    // Merge all metadata sources
    const result = mergeMetadata(headerMetadata, configMetadata, jsonMetadata);
    
    logger.info('3MF metadata parsing completed', {
      filamentsFound: result.filaments.length,
      hasBasicInfo: !!(result.printTimeMinutes || result.layerCount),
      hasSlicerInfo: !!(result.slicerName || result.slicerVersion)
    });
    
    return result;
  } catch (error) {
    logger.error('Failed to parse 3MF metadata:', error);
    
    // Return empty result with error handling
    return { filaments: [] };
  }
}