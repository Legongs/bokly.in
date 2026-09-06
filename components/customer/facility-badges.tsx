import {
  Wifi, Wind, Car, Toilet, ChefHat, ConciergeBell, Volume2,
  Accessibility, Cctv, Zap, Droplets,
} from "lucide-react";

interface Facility {
  facility_type: string;
  is_available?: boolean;
}

interface FacilityBadgesProps {
  facilities: Facility[];
  className?: string;
}

const FACILITY_META: Record<string, { label: string; icon: React.ElementType }> = {
  wifi:                 { label: "Wi-Fi",             icon: Wifi },
  ac:                   { label: "AC",                icon: Wind },
  parking:              { label: "Parkir",            icon: Car },
  toilet:               { label: "Toilet",            icon: Toilet },
  kitchen:              { label: "Dapur",             icon: ChefHat },
  reception:            { label: "Resepsionis",       icon: ConciergeBell },
  soundproof:           { label: "Kedap Suara",       icon: Volume2 },
  wheelchair_accessible:{ label: "Akses Difabel",     icon: Accessibility },
  cctv:                 { label: "CCTV",              icon: Cctv },
  generator:            { label: "Genset",            icon: Zap },
  water_dispenser:      { label: "Dispenser Air",     icon: Droplets },
};

export function FacilityBadges({ facilities, className = "" }: FacilityBadgesProps) {
  const available = facilities.filter((f) => f.is_available !== false);
  if (available.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {available.map((facility) => {
        const meta = FACILITY_META[facility.facility_type];
        if (!meta) return null;
        const Icon = meta.icon;
        return (
          <span
            key={facility.facility_type}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold"
          >
            <Icon className="w-3.5 h-3.5" />
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}
