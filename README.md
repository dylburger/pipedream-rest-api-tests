# Pipedream REST API workflow tests

This repo contains a set of Jest tests to confirm [this Pipedream workflow](https://pipedream.com/@dylburger/mock-an-api-with-pipedream-and-kvdb-io-p_pWCnBq/readme) correctly implements a RESTful API.

## Setup

First, **Fork** [this Pipedream workflow](https://pipedream.com/@dylburger/mock-an-api-with-pipedream-and-kvdb-io-p_pWCnBq/readme). Copy the URL for the **Webhook** source that Pipedream generates for you.

Run `npm install` to install the dependencies.

You'll need to set the `REST_API_ENDPOINT` environment variable to be the value of the endpoint URL you copied from Pipedream. This URL should _not_ contain a trailing slash.

You can run

```bash
export REST_API_ENDPOINT=https://yourendpoint.m.pipedream.net
```

or create a `.env` file and use [something like the setup described here](https://medium.com/@lusbuab/using-dotenv-with-jest-7e735b34e55f) to ensure jest will load variables from that file into the environment.

### Usage

Run `npm test` to run the tests.
