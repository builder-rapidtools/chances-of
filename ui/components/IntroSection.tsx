import { Sparkles } from 'lucide-react';

function IntroSection() {
  return (
    <div className="container mx-auto px-4 pt-8 pb-4">
      <div className="max-w-3xl mx-auto text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">
          Explore uncertainty through simulation
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          A thinking instrument for interpreting probability. Configure a scenario below, run simulations, and examine results with confidence intervals.
        </p>
        <p className="text-sm text-muted-foreground">
          Try different assumptions. See how the numbers change.
        </p>
      </div>
    </div>
  );
}

export default IntroSection;
