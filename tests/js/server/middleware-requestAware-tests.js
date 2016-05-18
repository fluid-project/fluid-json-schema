/*

    Tests for the "schema Middleware" that rejects requests with invalid JSON payloads.

*/
"use strict";
var fluid =  require("infusion");
var gpii  = fluid.registerNamespace("gpii");

require("gpii-express");
gpii.express.loadTestingSupport();

require("../lib/errors");
require("../lib/checkResponseHeaders");
require("../lib/fixtures");

var kettle = require("kettle");
kettle.loadTestingSupport();

require("../../../");

fluid.registerNamespace("gpii.tests.schema.middleware.caseHolder");
gpii.tests.schema.middleware.caseHolder.examineResponse = function (response, body, shouldBeValid) {

    if (shouldBeValid) {
        gpii.test.schema.checkResponseHeaders(response, body);
    }
    else {
        gpii.test.schema.checkResponseHeaders(response, body, "message.json", "message.json");

        try {
            var jsonData = typeof body === "string" ? JSON.parse(body) : body;
            gpii.test.schema.hasFieldErrors(jsonData);
        }
        catch (e) {
            fluid.fail("There should be no parsing errors:\n" + e);
        }
    }
};

fluid.defaults("gpii.tests.schema.middleware.request", {
    gradeNames: ["kettle.test.request.http"],
    path:       {
        expander: {
            funcName: "fluid.stringTemplate",
            args: ["/gated/%method", { method: "{that}.options.method"}]
        }
    },
    headers: {
        accept: "application/json"
    },
    port:       "{testEnvironment}.options.port"
});

fluid.defaults("gpii.tests.schema.middleware.request.post", {
    gradeNames: ["gpii.tests.schema.middleware.request"],
    method:     "POST"
});

fluid.defaults("gpii.tests.schema.middleware.request.get", {
    gradeNames: ["gpii.tests.schema.middleware.request"],
    method:     "GET"
});

fluid.defaults("gpii.tests.schema.middleware.request.put", {
    gradeNames: ["gpii.tests.schema.middleware.request"],
    method:     "PUT"
});

// Wire in an instance of kettle.requests.request.http for each test and wire the check to its onError or onSuccess event
fluid.defaults("gpii.tests.schema.middleware.caseHolder", {
    gradeNames: ["gpii.test.express.caseHolder"],
    rawModules: [
        {
            name: "Testing the schema validation middleware in combination with the 'request aware' middleware...",
            tests: [
                {
                    name: "Testing a GET request with no body...",
                    type: "test",
                    sequence: [
                        {
                            func: "{emptyGetRequest}.send"
                        },
                        {
                            listener: "gpii.tests.schema.middleware.caseHolder.examineResponse",
                            event:    "{emptyGetRequest}.events.onComplete",
                            args:     ["{emptyGetRequest}.nativeResponse", "{arguments}.0", true]
                        }
                    ]
                },
                {
                    name: "Testing a GET request with bad JSON data...",
                    type: "test",
                    sequence: [
                        {
                            func: "{badJsonGetRequest}.send",
                            args: [{}]
                        },
                        {
                            listener: "gpii.tests.schema.middleware.caseHolder.examineResponse",
                            event:    "{badJsonGetRequest}.events.onComplete",
                            args:     ["{badJsonGetRequest}.nativeResponse", "{arguments}.0", false]
                        }
                    ]
                },
                {
                    name: "Testing a GET request with valid JSON data...",
                    type: "test",
                    sequence: [
                        {
                            func: "{goodJsonGetRequest}.send",
                            args: [{required: true}]
                        },
                        {
                            listener: "gpii.tests.schema.middleware.caseHolder.examineResponse",
                            event:    "{goodJsonGetRequest}.events.onComplete",
                            args:     ["{goodJsonGetRequest}.nativeResponse", "{arguments}.0", true]
                        }
                    ]
                },
                {
                    name: "Testing a POST request with no body...",
                    type: "test",
                    sequence: [
                        {
                            func: "{emptyPostRequest}.send"
                        },
                        {
                            listener: "gpii.tests.schema.middleware.caseHolder.examineResponse",
                            event:    "{emptyPostRequest}.events.onComplete",
                            args:     ["{emptyPostRequest}.nativeResponse", "{arguments}.0", true]
                        }
                    ]
                },
                {
                    name: "Testing a POST request with bad JSON data...",
                    type: "test",
                    sequence: [
                        {
                            func: "{badJsonPostRequest}.send",
                            args: [{}]
                        },
                        {
                            listener: "gpii.tests.schema.middleware.caseHolder.examineResponse",
                            event:    "{badJsonPostRequest}.events.onComplete",
                            args:     ["{badJsonPostRequest}.nativeResponse", "{arguments}.0", false]
                        }
                    ]
                },
                {
                    name: "Testing a POST request with valid JSON data...",
                    type: "test",
                    sequence: [
                        {
                            func: "{goodJsonPostRequest}.send",
                            args: [{required: true}]
                        },
                        {
                            listener: "gpii.tests.schema.middleware.caseHolder.examineResponse",
                            event:    "{goodJsonPostRequest}.events.onComplete",
                            args:     ["{goodJsonPostRequest}.nativeResponse", "{arguments}.0", true]
                        }
                    ]
                },
                {
                    name: "Testing a PUT request with no body...",
                    type: "test",
                    sequence: [
                        {
                            func: "{emptyPutRequest}.send"
                        },
                        {
                            listener: "gpii.tests.schema.middleware.caseHolder.examineResponse",
                            event:    "{emptyPutRequest}.events.onComplete",
                            args:     ["{emptyPutRequest}.nativeResponse", "{arguments}.0", true]
                        }
                    ]
                },
                {
                    name: "Testing a PUT request with bad JSON data...",
                    type: "test",
                    sequence: [
                        {
                            func: "{badJsonPutRequest}.send",
                            args: [{}]
                        },
                        {
                            listener: "gpii.tests.schema.middleware.caseHolder.examineResponse",
                            event:    "{badJsonPutRequest}.events.onComplete",
                            args:     ["{badJsonPutRequest}.nativeResponse", "{arguments}.0", false]
                        }
                    ]
                },
                {
                    name: "Testing a PUT request with valid JSON data...",
                    type: "test",
                    sequence: [
                        {
                            func: "{goodJsonPutRequest}.send",
                            args: [{required: true}]
                        },
                        {
                            listener: "gpii.tests.schema.middleware.caseHolder.examineResponse",
                            event:    "{goodJsonPutRequest}.events.onComplete",
                            args:     ["{goodJsonPutRequest}.nativeResponse", "{arguments}.0", true]
                        }
                    ]
                }
            ]
        }
    ],
    components: {
        emptyGetRequest: {
            type: "gpii.tests.schema.middleware.request.get"
        },
        nonJsonGetRequest: {
            type: "gpii.tests.schema.middleware.request.get"
        },
        badJsonGetRequest: {
            type: "gpii.tests.schema.middleware.request.get"
        },
        goodJsonGetRequest: {
            type: "gpii.tests.schema.middleware.request.get"
        },
        emptyPostRequest: {
            type: "gpii.tests.schema.middleware.request.post"
        },
        nonJsonPostRequest: {
            type: "gpii.tests.schema.middleware.request.post"
        },
        badJsonPostRequest: {
            type: "gpii.tests.schema.middleware.request.post"
        },
        goodJsonPostRequest: {
            type: "gpii.tests.schema.middleware.request.post"
        },
        emptyPutRequest: {
            type: "gpii.tests.schema.middleware.request.put"
        },
        nonJsonPutRequest: {
            type: "gpii.tests.schema.middleware.request.put"
        },
        badJsonPutRequest: {
            type: "gpii.tests.schema.middleware.request.put"
        },
        goodJsonPutRequest: {
            type: "gpii.tests.schema.middleware.request.put"
        }
    }
});

fluid.defaults("gpii.tests.schema.middleware.testEnvironment", {
    gradeNames: ["gpii.test.schema.testEnvironment"],
    port:       7533,
    components: {
        caseHolder: {
            type: "gpii.tests.schema.middleware.caseHolder"
        }
    }
});

gpii.tests.schema.middleware.testEnvironment();
