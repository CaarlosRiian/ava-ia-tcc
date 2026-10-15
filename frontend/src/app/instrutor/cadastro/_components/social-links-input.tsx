import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SocialLinksProps {
  linkedin: string;
  setLinkedin: (val: string) => void;
  portfolio: string;
  setPortfolio: (val: string) => void;
}

export function SocialLinksInput({ linkedin, setLinkedin, portfolio, setPortfolio }: SocialLinksProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="linkedin" className="font-boldtext-gray-700">LinkedIn</Label>
        <Input
          id="linkedin"
          className="h-12 rounded-x border border-gray-300 bg-white"
          placeholder="Link do perfil"
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="portfolio" className="font-bold bg-white text-gray-700">Portfólio / GitHub</Label>
        <Input
          id="portfolio"
          className="h-12 rounded-x border border-gray-300 bg-white"
          placeholder="Link do site"
          value={portfolio}
          onChange={(e) => setPortfolio(e.target.value)}
        />
      </div>
    </div>
  );
}