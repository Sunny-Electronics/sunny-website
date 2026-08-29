import {
  CircuitBoard,
  Cpu,
  HelpCircle,
  ThermometerSun,
  Timer,
  Watch,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { productsForSection } from "@/data/official-products";

export type QuoteFieldDef = {
  name: string;
  label: string;
  type: "text" | "select" | "textarea";
  options?: string[];
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  hint?: string;
};

export type QuoteTypeDef = {
  id: string;
  name: string;
  tagline: string;
  examples: string;
  icon: LucideIcon;
  hidden?: boolean;
  fields: QuoteFieldDef[];
};

const tempRangeOptions = [
  "-10 ~ 70 C",
  "-20 ~ 70 C",
  "-20 ~ 85 C",
  "-30 ~ 85 C",
  "-40 ~ 85 C",
  "-40 ~ 105 C",
  "-40 ~ 125 C",
];

const loadCapacitanceOptions = [
  "8 pF",
  "10 pF",
  "12 pF",
  "16 pF",
  "18 pF",
  "20 pF",
  "30 pF",
  "Series",
  "Not sure",
];

const toleranceOptions = [
  "+/-10 ppm",
  "+/-15 ppm",
  "+/-20 ppm",
  "+/-30 ppm",
  "+/-50 ppm",
  "+/-100 ppm",
];

const supplyVoltageOptions = ["1.8 V", "2.5 V", "3.3 V", "5.0 V"];

const uniqueOptions = (...groups: string[][]) => [
  ...new Set(groups.flat().filter(Boolean)),
];

const officialCrystalModels = productsForSection("Crystal Units").map(
  (product) => product.model,
);
const officialOscillatorModels = productsForSection("Crystal Oscillators").map(
  (product) => product.model,
);
const officialVcxoModels = productsForSection("VCXO").map(
  (product) => product.model,
);
const officialTcxoModels = productsForSection("TCXO & VCTCXO").map(
  (product) => product.model,
);

export const quoteTypes: QuoteTypeDef[] = [
  {
    id: "ats",
    name: "ATS Types",
    tagline: "Through-hole leaded crystal units for industrial designs.",
    examples: "ATS-49/U, ATS-25/U, HC-49/U",
    icon: CircuitBoard,
    fields: [
      {
        name: "package",
        label: "Package",
        type: "select",
        options: [
          "ATS-49/U — 13 mm Bulk Packing",
          "ATS-49/U — 16 mm Taping T&R",
          "ATS-49/U — 16 mm Insulator-Bulk",
          "ATS-49/U — 16 mm Insulator-Taping T&R",
          "ATS-25/U",
          "HC-49/U",
          ...officialCrystalModels.filter((model) =>
            /^(ATS|HC-|UM-|CH-)/i.test(model),
          ),
          "Not sure",
        ],
      },
      {
        name: "frequency",
        label: "Frequency (MHz)",
        type: "text",
        placeholder: "e.g. 16.000",
        required: true,
      },
      {
        name: "loadCapacitance",
        label: "Load capacitance",
        type: "select",
        options: loadCapacitanceOptions,
        defaultValue: "20 pF",
      },
      {
        name: "tolerance",
        label: "Frequency tolerance",
        type: "select",
        options: toleranceOptions,
        defaultValue: "+/-30 ppm",
      },
      {
        name: "tempRange",
        label: "Operating temperature",
        type: "select",
        options: tempRangeOptions,
        defaultValue: "-20 ~ 70 C",
      },
    ],
  },
  {
    id: "smd-crystal",
    name: "SMD Crystals",
    tagline: "Surface-mount MHz crystal units, 1.6 mm to 7.0 mm sizes.",
    examples: "SX-32, SX-22, SX-21, SX-8, SX-3L1, automotive SX-A series",
    icon: Cpu,
    fields: [
      {
        name: "package",
        label: "Package / size",
        type: "select",
        options: uniqueOptions([
          "SX-16 (1.6 x 1.2 mm)",
          "SX-21 (2.0 x 1.6 mm)",
          "SX-22 (2.5 x 2.0 mm)",
          "SX-32 (3.2 x 2.5 mm)",
          "SX-8 (5.0 x 3.2 mm)",
          "SX-7 (7.0 x 5.0 mm)",
          "SX-1 (ATS SMD)",
          "SX-3 (low profile ATS SMD)",
          "SX-3L1 (ATS SMD)",
          "SX-A21 automotive (2.0 x 1.6 mm)",
          "SX-A22 automotive (2.5 x 2.0 mm)",
          "SX-A32 automotive (3.2 x 2.5 mm)",
          "SX-A8 automotive (5.0 x 3.2 mm)",
          ...officialCrystalModels.filter((model) => /^SX-/i.test(model)),
          "Not sure",
        ]),
        defaultValue: "SX-32 (3.2 x 2.5 mm)",
      },
      {
        name: "frequency",
        label: "Frequency (MHz)",
        type: "text",
        placeholder: "e.g. 25.000",
        required: true,
      },
      {
        name: "loadCapacitance",
        label: "Load capacitance",
        type: "select",
        options: loadCapacitanceOptions,
        defaultValue: "12 pF",
      },
      {
        name: "tolerance",
        label: "Frequency tolerance",
        type: "select",
        options: toleranceOptions,
        defaultValue: "+/-30 ppm",
      },
      {
        name: "stability",
        label: "Frequency stability",
        type: "select",
        options: toleranceOptions,
        defaultValue: "+/-30 ppm",
      },
      {
        name: "tempRange",
        label: "Operating temperature",
        type: "select",
        options: tempRangeOptions,
        defaultValue: "-40 ~ 85 C",
      },
    ],
  },
  {
    id: "smd-oscillator",
    name: "SMD Oscillators",
    tagline: "Clock oscillators (XO) with CMOS output.",
    examples: "SCO-02, SCO-06, SCO-10, SCO-21, SCO-22, SCO-32, SCO-53",
    icon: Timer,
    fields: [
      {
        name: "series",
        label: "Series",
        type: "select",
        options: uniqueOptions([
          "SCO-02",
          "SCO-06",
          "SCO-10",
          "SCO-21",
          "SCO-22",
          "SCO-32",
          "SCO-53",
          ...officialOscillatorModels,
          "Not sure",
        ]),
        defaultValue: "SCO-32",
      },
      {
        name: "frequency",
        label: "Frequency (MHz)",
        type: "text",
        placeholder: "e.g. 24.576",
        required: true,
      },
      {
        name: "supplyVoltage",
        label: "Supply voltage",
        type: "select",
        options: supplyVoltageOptions,
        defaultValue: "3.3 V",
      },
      {
        name: "stability",
        label: "Frequency stability",
        type: "select",
        options: ["+/-25 ppm", "+/-50 ppm", "+/-100 ppm"],
        defaultValue: "+/-50 ppm",
      },
      {
        name: "tempRange",
        label: "Operating temperature",
        type: "select",
        options: ["0 ~ 70 C", "-20 ~ 70 C", "-40 ~ 85 C", "-40 ~ 105 C", "-40 ~ 125 C"],
        defaultValue: "-40 ~ 85 C",
      },
    ],
  },
  {
    id: "vcxo",
    name: "VCXO",
    tagline: "Voltage-controlled oscillators with pulling range options.",
    examples: "SVH series",
    icon: Waves,
    fields: [
      {
        name: "series",
        label: "Series / package",
        type: "select",
        options: [...officialVcxoModels, "Not sure"],
        defaultValue: officialVcxoModels[0],
      },
      {
        name: "frequency",
        label: "Frequency (MHz)",
        type: "text",
        placeholder: "e.g. 27.000",
        required: true,
      },
      {
        name: "supplyVoltage",
        label: "Supply voltage",
        type: "select",
        options: supplyVoltageOptions,
        defaultValue: "3.3 V",
      },
      {
        name: "pullingRange",
        label: "Pulling range",
        type: "select",
        options: [
          "+/-5 ppm min",
          "+/-10 ppm min",
          "+/-25 ppm min",
          "+/-50 ppm min",
          "+/-100 ppm min",
          "Not sure",
        ],
        defaultValue: "+/-50 ppm min",
      },
      {
        name: "output",
        label: "Output",
        type: "select",
        options: ["HCMOS", "Clipped sinewave"],
        defaultValue: "HCMOS",
      },
      {
        name: "tempRange",
        label: "Operating temperature",
        type: "select",
        options: ["-20 ~ 70 C", "-30 ~ 85 C", "-40 ~ 85 C"],
        defaultValue: "-20 ~ 70 C",
      },
    ],
  },
  {
    id: "tcxo",
    name: "TCXO",
    tagline: "Temperature-compensated oscillators for tight stability.",
    examples: "TCXO and VCTCXO formats",
    icon: ThermometerSun,
    fields: [
      {
        name: "series",
        label: "Series / package",
        type: "select",
        options: [...officialTcxoModels, "Not sure"],
        defaultValue: officialTcxoModels[0],
      },
      {
        name: "frequency",
        label: "Frequency (MHz)",
        type: "text",
        placeholder: "e.g. 19.200",
        required: true,
      },
      {
        name: "stability",
        label: "Frequency stability",
        type: "select",
        options: ["+/-0.5 ppm", "+/-1.0 ppm", "+/-2.0 ppm", "+/-2.5 ppm", "+/-5.0 ppm"],
        defaultValue: "+/-2.5 ppm",
      },
      {
        name: "vcFunction",
        label: "Voltage control",
        type: "select",
        options: ["TCXO (no voltage control)", "VCTCXO (with voltage control)"],
        defaultValue: "TCXO (no voltage control)",
      },
      {
        name: "supplyVoltage",
        label: "Supply voltage",
        type: "select",
        options: supplyVoltageOptions,
        defaultValue: "3.3 V",
      },
      {
        name: "output",
        label: "Output",
        type: "select",
        options: ["Clipped sinewave", "HCMOS"],
        defaultValue: "Clipped sinewave",
      },
      {
        name: "tempRange",
        label: "Operating temperature",
        type: "select",
        options: ["-20 ~ 70 C", "-30 ~ 85 C", "-40 ~ 85 C"],
        defaultValue: "-30 ~ 85 C",
      },
    ],
  },
  {
    id: "tuning-fork",
    name: "Tuning Fork",
    tagline: "32.768 kHz clock crystals for RTC and timekeeping.",
    examples: "CS-1610, CS-2012, CS-3215, CS-306",
    icon: Watch,
    fields: [
      {
        name: "package",
        label: "Package",
        type: "select",
        options: uniqueOptions([
          "CS-1610 (1.6 x 1.0 mm SMD)",
          "CS-2012 (2.0 x 1.2 mm SMD)",
          "CS-3215 (3.2 x 1.5 mm SMD)",
          "CS-306 (cylinder 3 x 8 mm)",
          "CS-405 (cylinder SMD)",
          "CS-406 (cylinder SMD)",
          "CS-519",
          "CS-146",
          ...officialCrystalModels.filter((model) => /^CS-/i.test(model)),
          "Not sure",
        ]),
        defaultValue: "CS-3215 (3.2 x 1.5 mm SMD)",
      },
      {
        name: "frequency",
        label: "Frequency",
        type: "text",
        defaultValue: "32.768 kHz",
        required: true,
      },
      {
        name: "loadCapacitance",
        label: "Load capacitance",
        type: "select",
        options: ["6.0 pF", "7.0 pF", "9.0 pF", "12.5 pF", "Not sure"],
        defaultValue: "12.5 pF",
      },
      {
        name: "tolerance",
        label: "Frequency tolerance",
        type: "select",
        options: ["+/-10 ppm", "+/-20 ppm", "+/-30 ppm"],
        defaultValue: "+/-20 ppm",
      },
      {
        name: "tempRange",
        label: "Operating temperature",
        type: "select",
        options: ["-10 ~ 60 C", "-20 ~ 70 C", "-40 ~ 85 C"],
        defaultValue: "-40 ~ 85 C",
      },
    ],
  },
  {
    id: "other",
    name: "Not Sure / Other",
    tagline: "Send what you know and Sunny will identify the right product.",
    examples: "Part number, datasheet, or a plain description",
    icon: HelpCircle,
    hidden: true,
    fields: [
      {
        name: "description",
        label: "What do you know?",
        type: "textarea",
        placeholder:
          "Example: Need a 32 MHz small crystal for industrial temperature, not sure which package. Current part number is ...",
        required: true,
      },
    ],
  },
];

export function getQuoteType(id: string): QuoteTypeDef | undefined {
  return quoteTypes.find((type) => type.id === id);
}
