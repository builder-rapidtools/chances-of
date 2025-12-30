import { Moon, Sun, Copy, Terminal } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from './theme-provider';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './ui/tooltip';
import { ResultData, RequestPayload } from '../App';
import { HowToUseGuide } from './HowToUseGuide';

interface HeaderProps {
  result: ResultData | null;
  requestPayload: RequestPayload | null;
}

function Header({ result, requestPayload }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const copyCLICommand = () => {
    if (!requestPayload) return;

    const { scenario, params, options } = requestPayload;
    let cmd = `chances-of ${scenario}`;

    // Add params
    Object.entries(params).forEach(([key, value]) => {
      cmd += ` --${key} ${value}`;
    });

    // Add options
    if (options.exact) {
      cmd += ' --exact';
    } else {
      if (options.seed !== undefined) cmd += ` --seed ${options.seed}`;
      if (options.trials) cmd += ` --trials ${options.trials}`;
      if (options.target_ci_width)
        cmd += ` --target-ci-width ${options.target_ci_width}`;
    }

    navigator.clipboard.writeText(cmd);
  };

  const copyJSON = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            What Are the Chances?
          </h1>
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
              <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Theme">
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

export default Header;
