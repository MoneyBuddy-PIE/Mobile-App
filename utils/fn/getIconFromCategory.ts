
export const categories: {value: string; label: string}[] = [
    { value: "meal", label: "Repas" },
    { value: "snack", label: "Goûter" },
    { value: "games", label: "Jeux" },
    { value: "clothing", label: "Vêtement" },
    { value: "leisure", label: "Loisirs" },
    { value: "reading", label: "Lecture" },
    { value: "outing", label: "Sortie" },
    { value: "gift", label: "Cadeau" },
    { value: "transport", label: "Transport" },
    { value: "school", label: "École" },
    { value: "other", label: "Autre" }
]

const getIconFromCategory = (category: string): string => {

    switch (category) {
        default:
            return "wallet"
    }
}

export default getIconFromCategory