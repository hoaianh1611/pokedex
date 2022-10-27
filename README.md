# POKEMON API

## Install

    npm install

## Run the app

    npm run dev

# REST API

The REST API to the example app is described below.

## Get list of Pokemons

### Request

`GET`

    http://localhost:5500/pokemons/

### Response

    {
      data: [
        {
          "id": 721,
          "name": "Druddigon",
          "types": ["dragon"],
          "height": "1.6 m",
          "weight": "139.0 kg",
          "abilities": "Rough Skin",
          "category": "Cave Pokémon",
          "url": "http://localhost:5500/db/img/721.jpg"
        }
      ],
      totalPokemons: 721
    }

## Get a specific pokemon

### Request

`GET /pokemon/id`

    http://localhost:5500/pokemons/1

### Response

    {
      data: [
        pokemon,
        previousPokemon,
        nextPokemon,
      ]
    }

## Get a non-existent pokemon

### Request

`GET /pokemon/id`

    http://localhost:5500/pokemons/9999

### Response

    Status: 404 Not Found

    {"status":404,"reason":"Pokemon not found"}

## Create a new Thing

### Request

`POST`

### Response
