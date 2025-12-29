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
    <header className="border-b bg-gradient-to-r from-card via-card to-primary/5">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            chances-of
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Probability Explorer</p>
        </div>

        <div className="flex items-center gap-2">
          <HowToUseGuide />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={copyCLICommand}
                disabled={!requestPayload}
              >
                <Terminal className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy CLI command</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={copyJSON}
                disabled={!result}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy results JSON</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={toggleTheme}>
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle theme</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}

export default Header;
