/* eslint-env jest */

jest.setTimeout(30000);

const axios = require("axios");
const { REST_API_ENDPOINT } = process.env;

// To issue responses, Pipedream requires we either pass an x-pipedream-response
// header or a pipedream_response=1 query string param. See
// https://docs.pipedream.com/notebook/sources/#http-responses
const headers = {
  "x-pipedream-response": "true"
};

async function resetAPI() {
  // Remove all keys and collections by hitting DELETE /
  await axios({
    method: "delete",
    url: REST_API_ENDPOINT,
    headers
  });
}

describe("We expect the API to be RESTful", () => {
  beforeEach(async () => {
    await resetAPI();
  });

  afterAll(async () => {
    await resetAPI();
  });

  test("GET / should return an empty array when we have no items", async () => {
    const res = await axios({
      method: "get",
      url: REST_API_ENDPOINT,
      headers
    });
    expect(res.status).toEqual(200);
    expect(res.data).toEqual([]);
  });

  test("GET against a non-existent resource should return a 404", async () => {
    const res = await axios({
      method: "get",
      url: `${REST_API_ENDPOINT}/this-key-does-not-exist/1`,
      headers,
      validateStatus: () => true
    });
    expect(res.status).toEqual(404);
  });

  test("POST to /names, then GET /names/1 should return the POSTed data", async () => {
    const postData = { name: "Luke Skywalker" };
    const resource = "names";
    const postRes = await axios({
      method: "post",
      url: `${REST_API_ENDPOINT}/${resource}`,
      headers,
      data: JSON.stringify(postData)
    });
    expect(postRes.status).toEqual(200);
    expect(postRes.data).toEqual({ id: 1, key: `/${resource}/1` });

    // Now make the GET request
    const getRes = await axios({
      method: "get",
      url: `${REST_API_ENDPOINT}/${resource}/1`,
      headers
    });
    expect(getRes.status).toEqual(200);
    expect(getRes.data).toEqual(postData);
  });

  test("POST to /cars, then /trucks. GET / should return /cars/1 and /trucks/1", async () => {
    const postData = { name: "Toyota Corolla" };
    const cars = "cars";
    await axios({
      method: "post",
      url: `${REST_API_ENDPOINT}/${cars}`,
      headers,
      data: JSON.stringify(postData)
    });

    const post2Data = { name: "Ford F150" };
    const trucks = "trucks";
    await axios({
      method: "post",
      url: `${REST_API_ENDPOINT}/${trucks}`,
      headers,
      data: JSON.stringify(post2Data)
    });

    // Now make the GET request
    const getRes = await axios({
      method: "get",
      url: `${REST_API_ENDPOINT}/`,
      headers
    });
    expect(getRes.status).toEqual(200);
    expect(getRes.data).toEqual([`/${cars}/1`, `/${trucks}/1`]);
  });

  test("POST to /names twice, then GET /names/2 should return the POSTed data", async () => {
    const postData = { name: "Luke Skywalker" };
    const resource = "names";
    const postRes = await axios({
      method: "post",
      url: `${REST_API_ENDPOINT}/${resource}`,
      headers,
      data: JSON.stringify(postData)
    });
    expect(postRes.status).toEqual(200);
    expect(postRes.data).toEqual({ id: 1, key: `/${resource}/1` });

    const post2Data = { name: "Han Solo" };
    const post2Res = await axios({
      method: "post",
      url: `${REST_API_ENDPOINT}/${resource}`,
      headers,
      data: JSON.stringify(post2Data)
    });
    expect(post2Res.status).toEqual(200);
    expect(post2Res.data).toEqual({ id: 2, key: `/${resource}/2` });

    // Now make the GET request
    const getRes = await axios({
      method: "get",
      url: `${REST_API_ENDPOINT}/${resource}/2`,
      headers
    });
    expect(getRes.status).toEqual(200);
    expect(getRes.data).toEqual(post2Data);
  });

  test("POST to /cars twice, then /trucks. GET /cars should return data on the two cars with their IDs", async () => {
    const postData = { name: "Toyota Corolla" };
    const cars = "cars";
    const id = { id: 1 };
    await axios({
      method: "post",
      url: `${REST_API_ENDPOINT}/${cars}`,
      headers,
      data: JSON.stringify(postData)
    });

    const post2Data = { name: "Honda Civic" };
    const id2 = { id: 2 };
    await axios({
      method: "post",
      url: `${REST_API_ENDPOINT}/${cars}`,
      headers,
      data: JSON.stringify(post2Data)
    });

    const post3Data = { name: "Ford F150" };
    const trucks = "trucks";
    await axios({
      method: "post",
      url: `${REST_API_ENDPOINT}/${trucks}`,
      headers,
      data: JSON.stringify(post2Data)
    });

    // Now make the GET request to /cars
    const getRes = await axios({
      method: "get",
      url: `${REST_API_ENDPOINT}/${cars}`,
      headers
    });

    expect(getRes.status).toEqual(200);
    expect(getRes.data).toEqual([
      { ...id, ...postData },
      { ...id2, ...post2Data }
    ]);
  });

  test("POST to /people a few times with complex objects. GET /people should return data on all people with their IDs", async () => {
    const postData = { name: "Luke" };
    const people = "people";
    const id = { id: 1 };
    await axios({
      method: "post",
      url: `${REST_API_ENDPOINT}/${people}`,
      headers,
      data: JSON.stringify(postData)
    });

    const post2Data = { name: "Leia" };
    const id2 = { id: 2 };
    await axios({
      method: "post",
      url: `${REST_API_ENDPOINT}/${people}`,
      headers,
      data: JSON.stringify(post2Data)
    });

    const post3Data = { name: "Amidala", position: "Senator" };
    id3 = { id: 3 };
    await axios({
      method: "post",
      url: `${REST_API_ENDPOINT}/${people}`,
      headers,
      data: JSON.stringify(post3Data)
    });

    // Now make the GET request to /people
    const getRes = await axios({
      method: "get",
      url: `${REST_API_ENDPOINT}/${people}`,
      headers
    });

    expect(getRes.status).toEqual(200);
    expect(getRes.data).toEqual([
      { ...id, ...postData },
      { ...id2, ...post2Data },
      { ...id3, ...post3Data }
    ]);
  });

  test("POST to /names, then PUT to /names/1. GET to /names/1 should return the updated data from the PUT", async () => {
    const postData = { name: "Luke Skywalker" };
    const resource = "names";
    const postRes = await axios({
      method: "post",
      url: `${REST_API_ENDPOINT}/${resource}`,
      headers,
      data: JSON.stringify(postData)
    });
    expect(postRes.status).toEqual(200);
    expect(postRes.data).toEqual({ id: 1, key: `/${resource}/1` });

    const putData = { name: "Han Solo" };
    const putRes = await axios({
      method: "put",
      url: `${REST_API_ENDPOINT}/${resource}/1`,
      headers,
      data: JSON.stringify(putData)
    });
    expect(putRes.status).toEqual(200);

    // Now make the GET request
    const getRes = await axios({
      method: "get",
      url: `${REST_API_ENDPOINT}/${resource}/1`,
      headers
    });
    expect(getRes.status).toEqual(200);
    expect(getRes.data).toEqual(putData);
  });

  test("POST to /names, then DELETE /names/1. GET to /names/1 should return a 404", async () => {
    const postData = { name: "Luke Skywalker" };
    const resource = "names";
    await axios({
      method: "post",
      url: `${REST_API_ENDPOINT}/${resource}`,
      headers,
      data: JSON.stringify(postData)
    });

    await axios({
      method: "delete",
      url: `${REST_API_ENDPOINT}/${resource}/1`,
      headers
    });

    const getRes = await axios({
      method: "get",
      url: `${REST_API_ENDPOINT}/${resource}/1`,
      headers,
      validateStatus: () => true
    });
    expect(getRes.status).toEqual(404);
  });
});
