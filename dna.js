class DNA {
    constructor(genes) {
        this.genes = genes;
    }

    color() {
        var red = this.genes["red"] ? this.genes["red"] : 0;
        var green = this.genes["green"] ? this.genes["green"] : 0;
        var blue = this.genes["blue"] ? this.genes["blue"] : 0;
        return "rgb(" + red + "," + green + "," + blue +")";
    }

    get sex() {
        return this.genes["sex"] > 125;
    }

    get maxSpawn() {
        return Math.min(this.genes["maxSpawn"], 20);
    }

    get speed() {
        return (this.genes["speed"] ? this.genes["speed"] : 10)/10;
    }

    get eatAnimals() {
        return this.genes["eatAnimals"] > 125;
    }

    crossing(dnaB) {
        var rGenes = {};
        var genesA = this.genes;
        var genesB = dnaB.genes;
        for (var gene in genesA) {
            if (genesB[gene] == undefined) {
                rGenes[gene] = genesA[gene];
            } else {
                rGenes[gene] = rndChoice([genesA[gene], genesB[gene]]);
            }
        }
        for (var gene in genesB) {
            if (!(gene in rGenes)) {
                rGenes[gene] = genesB[gene];
            }
        }

        //mutation
        for (var gene in rGenes) {
            if (rndChance(MUTATION_CHANCE)) {
                rGenes[gene] = rndInt(255);
            }
        }

        return new DNA(rGenes);
    }
}

