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
let db = fs.readFileSync(path.resolve(__dirname, "../db/db.json"), "utf-8");

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
  const allowedFilter = ["name", "type", "page", "limit"];
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
        result = result.length
          ? result.filter(
              (pokemon) => pokemon[condition] === filterQuery[condition]
            )
          : data.filter(
              (pokemon) => pokemon[condition] === filterQuery[condition]
            );
      });
    } else {
      result = data;
    }

    //then select number of result by offset
    result = result.slice(offset, offset + limit);
    //send response
    res.status(200).send(result);
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

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});

/**
 * params: /
 * description: post a book
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

    //post processing
    const newPokemon = {
      id: totalPokemons,
      name,
      types,
      url,
    };
    //Read data from db.json then parse to JSobject
    let db = fs.readFileSync("db.json", "utf-8");
    db = JSON.parse(db);
    const { data } = db;

    //Add new book to book JS object
    data.push(newPokemon);
    //Add new book to db JS object
    db.data = newPokemon;
    //db JSobject to JSON string
    db = JSON.stringify(db);
    //write and save to db.json
    fs.writeFileSync("db.json", db);

    //post send response
    res.status(200).send(newBook);
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
    const targetIndex = data.findIndex((pokemon) => {
      pokemon.id === singleId;
    });
    console.log(targetIndex);
    if (targetIndex < 0) {
      const exception = new Error(`Pokemon not found`);
      exception.statusCode = 404;
      throw exception;
    }
    //filter db object
    db.data = data.filter((pokemon) => pokemon.id !== singleId);

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
