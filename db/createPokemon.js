const fs = require("fs");
const csv = require("csvtojson");
const imgFolder = "./img";

const createPokemon = async () => {
  let newData = await csv().fromFile("pokemon.csv");
  let data = JSON.parse(fs.readFileSync("db.json"));
  let images = fs.readdirSync(imgFolder);

  images = images.map((e) => {
    return e.slice(0, -4);
  });

  newData = newData.map((e, i) => {
    let id = i + 1;
    let url = [];
    if (id) {
      images.find((p) => {
        if (p.includes("-")) {
          let image = p.split("-");
          if (parseInt(image[0]) === id) {
            return url.push(`http://localhost:5500/db/img/${p}.jpg`);
          }
        } else {
          if (parseInt(p) === id)
            return url.push(`http://localhost:5500/db/img/${p}.jpg`);
        }
      });
    }

    if (url.length != 0) {
      return {
        id: id,
        name: e.Name,
        types: e.Type2 ? [e.Type1, e.Type2] : [e.Type1],
        url: url,
      };
    }
  });

  newData = newData.filter((e) => {
    return e != null;
  });
  data.data = newData;
  data.totalPokemons = newData.length;

  fs.writeFileSync("db.json", JSON.stringify(data));
};

createPokemon();
