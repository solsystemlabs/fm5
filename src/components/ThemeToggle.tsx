import { ComputerDesktopIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { 
  Button, 
  Menu, 
  MenuTrigger, 
  Popover, 
  MenuItem,
  Collection 
} from 'react-aria-components';
import { useTheme } from '@/lib/theme-context';

const themes = [
  {
    value: 'system' as const,
    label: 'System',
    icon: ComputerDesktopIcon,
  },
  {
    value: 'light' as const,
    label: 'Light',
    icon: SunIcon,
  },
  {
    value: 'dark' as const,
    label: 'Dark',
    icon: MoonIcon,
  },
];

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  const currentTheme = themes.find(t => t.value === theme) || themes[0];
  const CurrentIcon = currentTheme.icon;

  return (
    <MenuTrigger>
      <Button className="relative inline-flex items-center justify-center rounded-md p-2 text-pewter-700 hover:bg-pewter-100 hover:text-pewter-900 focus:outline-none focus:ring-2 focus:ring-pewter-500 focus:ring-offset-2 dark:text-pewter-300 dark:hover:bg-pewter-800 dark:hover:text-pewter-100">
        <span className="sr-only">Toggle theme</span>
        <CurrentIcon className="h-5 w-5" aria-hidden="true" />
      </Button>
      <Popover 
        placement="bottom end"
        className="w-40 rounded-md border border-border bg-popover p-1 shadow-lg outline-none"
      >
        <Menu 
          className="outline-none"
          onAction={(key) => setTheme(key as 'system' | 'light' | 'dark')}
        >
          <Collection items={themes}>
            {(item) => (
              <MenuItem
                key={item.value}
                id={item.value}
                className="group relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[selected]:bg-accent data-[selected]:text-accent-foreground"
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
                {theme === item.value && (
                  <span className="ml-auto">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                )}
              </MenuItem>
            )}
          </Collection>
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}