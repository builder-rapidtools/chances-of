import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Copy, Terminal, Sun, Moon } from 'lucide-react';
import HowToUseGuide from './HowToUseGuide';
import { useTheme } from './theme-provider';

interface HeaderProps {
  copyCLICommand: () => void;
  copyJSON: () => void;
  requestPayload?: unknown;
  result?: unknown;
}

export default function Header({
  copyCLICommand,
  copyJSON,
  requestPayload,
  result,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Chances Of</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Explore probability through simulation
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <HowToUseGuide />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={copyCLICommand}
                disabled={!requestPayload}
                aria-label="Terminal"
              >
                <Terminal className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="center" className="text-xs">
              Terminal
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={copyJSON}
                disabled={!result}
                aria-label="Copy"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="center" className="text-xs">
              Copy
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                aria-label="Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="center" className="text-xs">
              Theme
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
