

const getRandomColor = () => {
    const list: string[] = ["F06C8A", "FD618C66", "BADBFF"]

    return "#" + list[Math.floor(Math.random() * list.length)]
}

export default getRandomColor