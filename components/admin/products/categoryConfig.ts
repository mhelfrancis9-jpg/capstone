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
        presets: ["XS", "S", "M", "L", "XL"],
        placeholder: "Custom size",
      },
      {
        flag: "color",
        field: "color",
        label: "Color",
        hint: "Bike color",
        presets: [
          "Matte Black",
          "Gloss Red",
          "Navy",
          "Olive",
          "White",
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
        presets: ["XS", "S", "M", "L", "XL"],
        placeholder: "Custom size",
      },
      {
        flag: "color",
        field: "color",
        label: "Color",
        hint: "Component color",
        presets: [
          "Matte Black",
          "Gloss Red",
          "Navy",
          "Olive",
          "White",
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
        presets: ["One Size", "S/M", "L/XL"],
        placeholder: "Custom size",
      },
      {
        flag: "color",
        field: "color",
        label: "Color",
        hint: "Accessory color",
        presets: [
          "Matte Black",
          "Gloss Red",
          "Navy",
          "Olive",
          "White",
        ],
        placeholder: "Custom color",
      },
    ],
  },
  frameset: {
    note: "Size, Color",
    axes: [
      {
        flag: "size",
        field: "size",
        label: "Size",
        hint: "Frame size",
        presets: ["XS", "S", "M", "L", "XL"],
        placeholder: "Custom size",
      },
      {
        flag: "color",
        field: "color",
        label: "Color",
        hint: "Frame color",
        presets: [
          "Matte Black",
          "Gloss Red",
          "Navy",
          "Olive",
        ],
        placeholder: "Custom color",
      },
    ],
  },
  handlebar: {
    note: "Handlebar Width C-C",
    axes: [
      {
        flag: "width",
        field: "width",
        label: "Width",
        hint: "Handlebar width centre-to-centre",
        presets: [
          "400mm",
          "420mm",
          "440mm",
          "460mm",
          "480mm",
        ],
        placeholder: "Custom width",
      },
    ],
  },
  stem: {
    note: "Stem Length, Steerer Tube Size",
    axes: [
      {
        flag: "length",
        field: "length",
        label: "Length",
        hint: "Stem length",
        presets: [
          "50mm",
          "70mm",
          "90mm",
          "110mm",
          "130mm",
        ],
        placeholder: "Custom length",
      },
      {
        flag: "steerer",
        field: "steerer",
        label: "Steerer Tube",
        hint: "Steerer tube size",
        presets: [
          "1 1/8\"",
          "1 1/4\"",
          "Tapered",
        ],
        placeholder: "Custom steerer",
      },
    ],
  },
  seatpost: {
    note: "Diameter, Color",
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
          "Matte Black",
          "Gloss Red",
          "Silver",
        ],
        placeholder: "Custom color",
      },
    ],
  },
  saddle: {
    note: "No customization fields",
    axes: [],
  },
  wheelset: {
    note: "Rim Height or Depth, Freehub Body Standard",
    axes: [
      {
        flag: "rim",
        field: "rim",
        label: "Rim",
        hint: "Rim height or depth",
        presets: [
          "Shallow",
          "Medium",
          "Deep",
          "Clincher",
          "Tubeless",
        ],
        placeholder: "Custom rim",
      },
      {
        flag: "freehub",
        field: "freehub",
        label: "Freehub",
        hint: "Freehub body standard",
        presets: [
          "HG",
          "XD",
          "XDR",
          "N3W",
        ],
        placeholder: "Custom freehub",
      },
    ],
  },
  tires: {
    note: "Tire Size",
    axes: [
      {
        flag: "size",
        field: "size",
        label: "Tire Size",
        hint: "Tire size",
        presets: [
          "700x23c",
          "700x25c",
          "700x28c",
          "700x32c",
          "29x2.2\"",
          "27.5x2.2\"",
          "26x2.1\"",
        ],
        placeholder: "Custom size",
      },
    ],
  },
  "front-derailleur": {
    note: "No customization fields",
    axes: [],
  },
  "rear-derailleur": {
    note: "No customization fields",
    axes: [],
  },
  crankset: {
    note: "No customization fields",
    axes: [],
  },
  cassette: {
    note: "No customization fields",
    axes: [],
  },
  chain: {
    note: "No customization fields",
    axes: [],
  },
  brakeset: {
    note: "No customization fields",
    axes: [],
  },
  rotors: {
    note: "Rotor Size, Color",
    axes: [
      {
        flag: "size",
        field: "size",
        label: "Rotor Size",
        hint: "Rotor size",
        presets: ["140mm", "160mm", "180mm", "200mm"],
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
        presets: ["Small", "Medium", "Large"],
        placeholder: "Custom size",
      },
      {
        flag: "color",
        field: "color",
        label: "Color",
        hint: "Brake color",
        presets: [
          "Matte Black",
          "Silver",
          "Red",
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
        presets: ["10-speed", "11-speed", "12-speed"],
        placeholder: "Custom size",
      },
      {
        flag: "color",
        field: "color",
        label: "Color",
        hint: "Drivetrain color",
        presets: [
          "Matte Black",
          "Silver",
          "Red",
          "Gold",
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
        label: "Steerer Tube",
        hint: "Steerer tube size",
        presets: [
          "1 1/8\"",
          "1 1/4\"",
          "Tapered",
        ],
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
