export interface CategoryAxis {
  flag: string;
  field: string;
  label: string;
  hint: string;
  presets: string[];
  placeholder: string;
}

export interface CategoryConfig {
  note: string;
  /** 1-based step number in the Bike Builder, or undefined for non-builder categories. */
  stepNumber?: number;
  axes: CategoryAxis[];
}

export const categoryConfig: Record<string, CategoryConfig> = {
  bikes: {
    note: "Complete bicycles for every rider",
    axes: [
      {
        flag: "size",
        field: "size",
        label: "Size",
        hint: "Frame size",
        presets: [
          "XS",
          "S",
          "M",
          "L",
          "XL",
          "Small",
          "Medium",
          "Large",
          "X-Large",
        ],
        placeholder: "Custom size",
      },
      {
        flag: "color",
        field: "color",
        label: "Color",
        hint: "Bike color",
        presets: [
          "Black",
          "Matte Black",
          "White",
          "Red",
          "Blue",
          "Silver",
          "Signal Yellow",
          "Raw Alloy",
        ],
        placeholder: "Custom color",
      },
    ],
  },
  parts: {
    note: "Bicycle components and spare parts",
    axes: [
      {
        flag: "size",
        field: "size",
        label: "Size",
        hint: "Component size",
        presets: [
          "XS",
          "S",
          "M",
          "L",
          "XL",
          "Small",
          "Medium",
          "Large",
          "X-Large",
        ],
        placeholder: "Custom size",
      },
      {
        flag: "color",
        field: "color",
        label: "Color",
        hint: "Component color",
        presets: [
          "Black",
          "Matte Black",
          "White",
          "Red",
          "Blue",
          "Silver",
          "Signal Yellow",
          "Raw Alloy",
        ],
        placeholder: "Custom color",
      },
    ],
  },
  accessories: {
    note: "Gear, helmets and riding accessories",
    axes: [
      {
        flag: "size",
        field: "size",
        label: "Size",
        hint: "Accessory size",
        presets: [
          "XS",
          "S",
          "M",
          "L",
          "XL",
          "Small",
          "Medium",
          "Large",
          "X-Large",
        ],
        placeholder: "Custom size",
      },
      {
        flag: "color",
        field: "color",
        label: "Color",
        hint: "Accessory color",
        presets: [
          "Black",
          "Matte Black",
          "White",
          "Red",
          "Blue",
          "Silver",
          "Signal Yellow",
          "Raw Alloy",
        ],
        placeholder: "Custom color",
      },
    ],
  },
  frameset: {
    note: "Size, Color",
    stepNumber: 1,
    axes: [
      {
        flag: "size",
        field: "size",
        label: "Size",
        hint: "Frame size",
        presets: [
          "XS",
          "S",
          "M",
          "L",
          "XL",
          "Small",
          "Medium",
          "Large",
          "X-Large",
        ],
        placeholder: "Custom size",
      },
      {
        flag: "color",
        field: "color",
        label: "Color",
        hint: "Frame color",
        presets: [
          "Black",
          "Matte Black",
          "White",
          "Red",
          "Blue",
          "Silver",
          "Signal Yellow",
          "Raw Alloy",
        ],
        placeholder: "Custom color",
      },
    ],
  },
  handlebar: {
    note: "Handlebar Width C-C",
    stepNumber: 2,
    axes: [
      {
        flag: "width",
        field: "width",
        label: "Handlebar Width C-C",
        hint: "Handlebar width centre-to-centre",
        presets: [
          "360mm",
          "380mm",
          "400mm",
          "420mm",
          "440mm",
          "720mm",
          "740mm",
          "760mm",
          "780mm",
        ],
        placeholder: "Custom width",
      },
    ],
  },
  stem: {
    note: "Stem Length, Steerer Tube Size",
    stepNumber: 3,
    axes: [
      {
        flag: "length",
        field: "length",
        label: "Stem Length",
        hint: "Stem length",
        presets: [
          "60mm",
          "70mm",
          "80mm",
          "90mm",
          "100mm",
          "110mm",
          "120mm",
          "130mm",
        ],
        placeholder: "Custom length",
      },
      {
        flag: "steerer",
        field: "steerer",
        label: "Steerer Tube Size",
        hint: "Steerer tube size",
        presets: ['1"', '1 1/8"', '1 1/4"', 'Tapered 1.5"'],
        placeholder: "Custom steerer",
      },
    ],
  },
  seatpost: {
    note: "Diameter, Color",
    stepNumber: 4,
    axes: [
      {
        flag: "diameter",
        field: "diameter",
        label: "Diameter",
        hint: "Seatpost diameter",
        presets: [
          "27.2mm",
          "30.9mm",
          "31.6mm",
          "34.9mm",
        ],
        placeholder: "Custom diameter",
      },
      {
        flag: "color",
        field: "color",
        label: "Color",
        hint: "Seatpost color",
        presets: [
          "Black",
          "Matte Black",
          "White",
          "Red",
          "Blue",
          "Silver",
          "Signal Yellow",
          "Raw Alloy",
        ],
        placeholder: "Custom color",
      },
    ],
  },
  saddle: {
    note: "No customization fields",
    stepNumber: 5,
    axes: [],
  },
  wheelset: {
    note: "Rim Height or Depth, Freehub Body Standard",
    stepNumber: 6,
    axes: [
      {
        flag: "rim",
        field: "rim",
        label: "Rim Height or Depth",
        hint: "Rim height or depth",
        presets: [
          "24mm",
          "30mm",
          "35mm",
          "45mm",
          "50mm",
          "65mm",
          "80mm",
        ],
        placeholder: "Custom rim",
      },
      {
        flag: "freehub",
        field: "freehub",
        label: "Freehub Body Standard",
        hint: "Freehub body standard",
        presets: [
          "Shimano HG",
          "Shimano Micro Spline",
          "SRAM XDR",
          "SRAM XD",
          "Campagnolo N3W",
        ],
        placeholder: "Custom freehub",
      },
    ],
  },
  tires: {
    note: "Tire Size",
    stepNumber: 7,
    axes: [
      {
        flag: "size",
        field: "size",
        label: "Tire Size",
        hint: "Tire size",
        presets: [
          "700x25c",
          "700x28c",
          "700x30c",
          "700x32c",
          "29x2.25",
          "29x2.35",
          "27.5x2.25",
        ],
        placeholder: "Custom size",
      },
    ],
  },
  "front-derailleur": {
    note: "No customization fields",
    stepNumber: 8,
    axes: [],
  },
  "rear-derailleur": {
    note: "No customization fields",
    stepNumber: 9,
    axes: [],
  },
  crankset: {
    note: "No customization fields",
    stepNumber: 10,
    axes: [],
  },
  cassette: {
    note: "No customization fields",
    stepNumber: 11,
    axes: [],
  },
  chain: {
    note: "No customization fields",
    stepNumber: 12,
    axes: [],
  },
  brakeset: {
    note: "No customization fields",
    stepNumber: 13,
    axes: [],
  },
  rotors: {
    note: "Rotor Size, Color",
    stepNumber: 14,
    axes: [
      {
        flag: "size",
        field: "size",
        label: "Rotor Size",
        hint: "Rotor size",
        presets: ["140mm", "160mm", "180mm", "203mm"],
        placeholder: "Custom size",
      },
      {
        flag: "color",
        field: "color",
        label: "Color",
        hint: "Rotor color",
        presets: [
          "Matte Black",
          "Silver",
          "Red",
        ],
        placeholder: "Custom color",
      },
    ],
  },
  pedals: {
    note: "No customization fields",
    stepNumber: 15,
    axes: [],
  },
  brakes: {
    note: "Legacy — Size, Color",
    axes: [
      {
        flag: "size",
        field: "size",
        label: "Size",
        hint: "Brake size",
        presets: [
          "XS",
          "S",
          "M",
          "L",
          "XL",
          "Small",
          "Medium",
          "Large",
          "X-Large",
        ],
        placeholder: "Custom size",
      },
      {
        flag: "color",
        field: "color",
        label: "Color",
        hint: "Brake color",
        presets: [
          "Black",
          "Matte Black",
          "White",
          "Red",
          "Blue",
          "Silver",
          "Signal Yellow",
          "Raw Alloy",
        ],
        placeholder: "Custom color",
      },
    ],
  },
  drivetrain: {
    note: "Legacy — Size, Color",
    axes: [
      {
        flag: "size",
        field: "size",
        label: "Size",
        hint: "Drivetrain size",
        presets: [
          "XS",
          "S",
          "M",
          "L",
          "XL",
          "Small",
          "Medium",
          "Large",
          "X-Large",
        ],
        placeholder: "Custom size",
      },
      {
        flag: "color",
        field: "color",
        label: "Color",
        hint: "Drivetrain color",
        presets: [
          "Black",
          "Matte Black",
          "White",
          "Red",
          "Blue",
          "Silver",
          "Signal Yellow",
          "Raw Alloy",
        ],
        placeholder: "Custom color",
      },
    ],
  },
  suspension: {
    note: "Steerer Tube Size",
    axes: [
      {
        flag: "steerer",
        field: "steerer",
        label: "Steerer Tube Size",
        hint: "Steerer tube size",
        presets: ['1"', '1 1/8"', '1 1/4"', 'Tapered 1.5"'],
        placeholder: "Custom steerer",
      },
    ],
  },
};

export function getCategoryNote(slug: string | null | undefined): string {
  if (!slug) return "";
  return categoryConfig[slug]?.note ?? "";
}

export function getCategoryAxes(slug: string | null | undefined): CategoryAxis[] {
  if (!slug) return [];
  return categoryConfig[slug]?.axes ?? [];
}

/** Returns the 1-based Bike Builder step number for a category slug, or null if it is not a builder step. */
export function getStepNumber(slug: string | null | undefined): number | null {
  if (!slug) return null;
  return categoryConfig[slug]?.stepNumber ?? null;
}
