function rndChoice(choices) {
    return choices[Math.floor(Math.random() * choices.length)]
}

function rndInt(max) {
    return Math.floor(Math.random() * max)
}

function rndRange(min, max) {
    return Math.floor(Math.random() * (Math.abs(max) + Math.abs(min)-1)) + min;
}

function rndChance(p) {
    return Math.random() > (1-p);
}
