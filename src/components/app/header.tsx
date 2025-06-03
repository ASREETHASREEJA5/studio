import type { FC } from 'react';
import { BrainCircuit } from 'lucide-react';

interface HeaderProps {
  appName: string;
}

const Header: FC<HeaderProps> = ({ appName }) => {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 sm:py-6 flex items-center">
        <BrainCircuit size={32} className="mr-3 text-accent" />
        <h1 className="text-2xl sm:text-3xl font-headline font-bold">{appName}</h1>
      </div>
    </header>
  );
};

export default Header;
