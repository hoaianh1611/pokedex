const fs = require("fs");
const csv = require("csvtojson");
const imgFolder = "./img";

const createPokemon = async () => {
  let newData = await csv().fromFile("pokemon.csv");
  let data = JSON.parse(fs.readFileSync("../db.json"));
  let images = fs.readdirSync(imgFolder);

  images = images.map((e) => {
    return e.slice(0, -4);
  });

  newData = newData.map((e, i) => {
    let id = i + 1;
    let url;
    if (id) {
      images.find((p) => {
        if (p.includes("-")) {
          let image = p.split("-");
          if (parseInt(image[0]) === id) {
            return (url = `http://localhost:5500/db/img/${p}.jpg`);
          }
        } else {
          if (parseInt(p) === id)
            return (url = `http://localhost:5500/db/img/${p}.jpg`);
        }
      });
    }

    if (url) {
      return {
        id: id,
        name: e.name.toLowerCase(),
        types: e.type_2
          ? [e.type_1.toLowerCase(), e.type_2.toLowerCase()]
          : [e.type_1.toLowerCase()],
        height: `${e.height_m} m`,
        weight: `${e.weight_kg} kg`,
        abilities: e.ability_1.toLowerCase(),
        category: e.species.toLowerCase(),
        url: url,
      };
    }
  });

  newData = newData.filter((e) => {
    return e != null;
  });
  data.data = newData;
  data.totalPokemons = newData.length;

  fs.writeFileSync("../db.json", JSON.stringify(data));
};

createPokemon();
