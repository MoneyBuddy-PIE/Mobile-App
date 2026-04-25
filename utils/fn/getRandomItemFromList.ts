

const getRandomItemFromList = (list: string[]) => {
    return list[Math.floor(Math.random() * list.length)]
}

export default getRandomItemFromList