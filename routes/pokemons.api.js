const fs = require("fs");
const crypto = require("crypto");
var express = require("express");
var router = express.Router();
const path = require("path");

const pokemonTypes = [
  "bug",
  "dragon",
  "fairy",
  "fire",
  "ghost",
  "ground",
  "normal",
  "psychic",
  "steel",
  "dark",
  "electric",
  "fighting",
  "flyingText",
  "grass",
  "ice",
  "poison",
  "rock",
  "water",
];

//Read data from db.json then parse to JSobject
let db = fs.readFileSync("db.json", "utf-8");

db = JSON.parse(db);
const { data } = db;
const totalPokemons = db.totalPokemons;

/**
 * params: /
 * description: get all books
 * query:
 * method: get
 */

router.get("/", function (req, res, next) {
  //input validation
  const allowedFilter = [
    "search",
    "type",
    "abilities",
    "category",
    "page",
    "limit",
  ];
  try {
    let { page, limit, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    //allow title,limit and page query string only
    const filterKeys = Object.keys(filterQuery);

    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) {
        const exception = new Error(`Query ${key} is not allowed`);
        exception.statusCode = 401;
        throw exception;
      }
      if (!filterQuery[key]) delete filterQuery[key];
    });
    //processing logic
    //Number of items skip for selection
    let offset = limit * (page - 1);

    //Filter data by title

    let result = [];

    if (filterKeys.length) {
      filterKeys.forEach((condition) => {
        if (filterKeys == "type") {
          result = result.length
            ? result.filter((pokemon) =>
                pokemon.types.includes(filterQuery[condition].toLowerCase())
              )
            : data.filter((pokemon) =>
                pokemon.types.includes(filterQuery[condition].toLowerCase())
              );
        } else if (filterKeys == "search") {
          result = result.length
            ? result.filter((pokemon) =>
                pokemon.name.includes(filterQuery[condition].toLowerCase())
              )
            : data.filter((pokemon) =>
                pokemon.name.includes(filterQuery[condition].toLowerCase())
              );
        } else {
          result = result.length
            ? result.filter(
                (pokemon) => pokemon[condition] === filterQuery[condition]
              )
            : data.filter(
                (pokemon) => pokemon[condition] === filterQuery[condition]
              );
        }
      });
    } else {
      result = data;
    }
    let newData = {
      data: result.slice(offset, offset + limit),
      totalPokemons: result.length,
    };
    //then select number of result by offset
    // result = result.slice(offset, offset + limit);

    //send response
    res.status(200).send(newData);
  } catch (error) {
    next(error);
  }
});

router.get("/:singleid", function (req, res, next) {
  //input validation
  try {
    const { singleid } = req.params;

    let result = {};

    const index = data.findIndex((e) => e.id == singleid);

    if (data.filter((e) => e.id != singleid).length > 0) {
      const exception = new Error(`Pokemon not found`);
      exception.statusCode = 401;
      throw exception;
    }

    if (index == 0) {
      result = {
        pokemon: data[index],
        previousPokemon: data[totalPokemons - 1],
        nextPokemon: data[index + 1],
      };
    } else if (index == totalPokemons - 1) {
      result = {
        pokemon: data[index],
        previousPokemon: data[index - 1],
        nextPokemon: data[0],
      };
    } else {
      result = {
        pokemon: data[index],
        previousPokemon: data[index - 1],
        nextPokemon: data[index + 1],
      };
    }

    let newData = { data: result };

    res.status(200).send(newData);
  } catch (error) {
    next(error);
  }
});

/**
 * params: /
 * description: post a pokemon
 * query:
 * method: post
 */

router.post("/", (req, res, next) => {
  //post input validation
  try {
    const { id, name, types, url } = req.body;
    if (!id || !name || !types || !url) {
      const exception = new Error(`Missing body info`);
      exception.statusCode = 401;
      throw exception;
    }

    if (data.filter((e) => e.id == id || e.name == name).length > 0) {
      const exception = new Error(`The Pokémon already exists.`);
      exception.statusCode = 401;
      throw exception;
    }

    if (types.some((t) => pokemonTypes.includes(t)) === false) {
      const exception = new Error(`Pokémon's type is invalid.`);
      exception.statusCode = 401;
      throw exception;
    }

    if (types.length > 2) {
      const exception = new Error(`Pokémon can only have one or two types.`);
      exception.statusCode = 401;
      throw exception;
    }

    //post processing
    const newPokemon = {
      id: id || totalPokemons,
      name,
      types,
      url,
    };

    //Add new pokemon to pokemon JS object
    data.push(newPokemon);
    //Add new pokemon to db JS object
    db.data = data;
    //db JSobject to JSON string
    db = JSON.stringify(db);
    //write and save to db.json
    fs.writeFileSync("db.json", db);

    //post send response
    res.status(200).send(newPokemon);
  } catch (error) {
    next(error);
  }
});

/**
 * params: /
 * description: update a pokemon
 * query:
 * method: put
 */

router.put("/:singleId", (req, res, next) => {
  //put input validation
  try {
    const allowUpdate = ["name", "types", "url"];

    const { singleId } = req.params;

    const updates = req.body;
    const updateKeys = Object.keys(updates);
    //find update request that not allow
    const notAllow = updateKeys.filter((el) => !allowUpdate.includes(el));

    if (notAllow.length) {
      const exception = new Error(`Update field not allow`);
      exception.statusCode = 401;
      throw exception;
    }

    //put processing

    //find book by id
    const targetIndex = data.findIndex((i) => i.id === singleId);
    if (targetIndex < 0) {
      const exception = new Error(`Pokemon not found`);
      exception.statusCode = 404;
      throw exception;
    }

    //Update new content to db book JS object
    const updatedPokemon = { ...db.data[targetIndex], ...updates };
    db.data[targetIndex] = updatedPokemon;

    //db JSobject to JSON string
    db = JSON.stringify(db);

    //write and save to db.json
    fs.writeFileSync("db.json", db);

    //put send response
    res.status(200).send(updatedBook);
  } catch (error) {
    next(error);
  }
});

/**
 * params: /
 * description: delete a pokemon
 * query:
 * method: delete
 */

router.delete("/:singleId", (req, res, next) => {
  //delete input validation
  try {
    const { singleId } = req.params;
    //delete processing
    //find pokemon by id
    const targetIndex = data.findIndex((item) => item.id == singleId);

    if (targetIndex < 0) {
      const exception = new Error(`Pokemon not found`);
      exception.statusCode = 404;
      throw exception;
    }
    //filter db object
    db.data = data.filter((pokemon) => pokemon.id != singleId);
    db.totalPokemons = db.data.length;

    //db JSobject to JSON string
    db = JSON.stringify(db);

    //write and save to db.json
    fs.writeFileSync("db.json", db);

    //delete send response
    res.status(200).send({});
  } catch (error) {
    next(error);
  }
});

module.exports = router;
