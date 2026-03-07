export const CATEGORIES = [
    "Leadership",
    "Teamwork / Collaboration",
    "Communication",
    "Conflic Resolution",
    "Problem Solving",
    "Adaptability",
    "Time Management",
    "Ownership",
    "Failure / Mistake",
    "Creativity / Innovation",
    "Growth / Learning",
] as const;

export const CATEGORY_BADGE_MAP: Record<string, string> = {
    "Leadership": "badge-purple",
    "Teamwork / Collaboration": "badge-cyan",
    "Communication": "badge-green",
    "Conflic Resolution": "badge-pink",
    "Problem Solving": "badge-orange",
    "Adaptability": "badge-yellow",
    "Time Management": "badge-primary",
    "Ownership": "badge-purple",
    "Failure / Mistake": "badge-pink",
    "Creativity / Innovation": "badge-cyan",
    "Growth / Learning": "badge-green",
};

// Pie chart colors (hex)
export const CHART_COLORS = [
    "#7c3aed", "#0891b2", "#059669", "#db2777", "#ea580c", "#d97706",
    "#2563eb", "#7c3aed", "#db2777", "#0891b2", "#059669",
] as const;

export function getChartColor(category: string): string {
    const idx = (CATEGORIES as readonly string[]).indexOf(category);
    return idx >= 0 ? CHART_COLORS[idx % CHART_COLORS.length] : "#94a3b8";
}

export function getBadgeClass(category: string): string {
    return CATEGORY_BADGE_MAP[category] || "badge-primary";
}