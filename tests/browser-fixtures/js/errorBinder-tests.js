/* global fluid, jQuery, jqUnit */
var fluid_3_0_0 = fluid_3_0_0 || {};
(function (fluid, $, jqUnit) {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.tests.schema.errorBinder");

    gpii.tests.schema.errorBinder.checkElements = function (elementDefs) {
        fluid.each(elementDefs, function (elementDef) {
            var elements = fluid.makeArray($(elementDef.selector));
            jqUnit.assertTrue("There should be " + elementDef.expectedElements + " element(s).", elements.length === elementDef.expectedElements);

            fluid.each(elements, function (element) {
                if (elementDef.mustMatch) {
                    fluid.each(fluid.makeArray(elementDef.mustMatch), function (matchingPattern) {
                        jqUnit.assertTrue("The element should match the pattern '" + matchingPattern + "'.", $(element).text().match(matchingPattern));
                    });
                }
                if (elementDef.mustNotMatch) {
                    fluid.each(fluid.makeArray(elementDef.mustNotMatch), function (nonMatchingPattern) {
                        jqUnit.assertFalse("The element should not match the pattern '" + nonMatchingPattern + "'.", $(element).text().match(nonMatchingPattern));
                    });
                }
            });
        });
    };

    gpii.tests.schema.errorBinder.changeModelValue = function (environment, componentName, valuePath, valueToSet) {
        var component = fluid.get(environment, componentName);
        component.applier.change(valuePath, valueToSet, valueToSet !== null ? "ADD" : "DELETE");
    };

    gpii.tests.schema.errorBinder.submitForm = function (selector) {
        $(selector).submit();
    };

    fluid.defaults("gpii.tests.schema.errorBinder.caseHolder", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name:  "Testing the client-side error binder component...",
            tests: [
                {
                    name: "Confirm that initial client-side validation errors appear correctly after startup...",
                    sequence: [
                        { func: "{testEnvironment}.events.constructFixtures.fire" },
                        {
                            event: "{testEnvironment}.events.onFixturesReady",
                            listener: "gpii.tests.schema.errorBinder.checkElements",
                            args: [[
                                // Summary message.
                                {
                                    selector: ".errorBinder-viewport .fieldErrors",
                                    mustMatch: "The information you provided is incomplete or incorrect",
                                    expectedElements: 1
                                },
                                // Field-level validation message.
                                {
                                    selector: ".errorBinder-viewport .fieldError",
                                    mustMatch: "This value is required.",
                                    expectedElements: 1
                                }
                            ]]
                        }
                    ]
                },
                {
                    name: "Confirm that feedback on a required field is set and unset as needed...",
                    sequence: [
                        { func: "{testEnvironment}.events.constructFixtures.fire" },
                        {
                            event: "{testEnvironment}.events.onFixturesReady",
                            listener: "gpii.tests.schema.errorBinder.changeModelValue",
                            args: ["{testEnvironment}", "errorBinder", "shallowlyRequired", "has a value"] // environment, componentName, valuePath, valueToSet
                        },
                        {
                            func: "gpii.tests.schema.errorBinder.checkElements",
                            args: [[
                                // Summary message.
                                {
                                    selector: ".errorBinder-viewport .fieldErrors",
                                    expectedElements: 0
                                },
                                // Field-level validation message.
                                {
                                    selector: ".errorBinder-viewport .fieldError",
                                    expectedElements: 0
                                }
                            ], "{testEnvironment}"]
                        },
                        {
                            func: "gpii.tests.schema.errorBinder.changeModelValue",
                            args: ["{testEnvironment}", "errorBinder", "shallowlyRequired", null] // environment, componentName, valuePath, valueToSet
                        },
                        {
                            func: "gpii.tests.schema.errorBinder.checkElements",
                            args: [[
                                // Summary message.
                                {
                                    selector: ".errorBinder-viewport .fieldErrors",
                                    mustMatch: "The information you provided is incomplete or incorrect",
                                    expectedElements: 1
                                },
                                // Field-level validation messages.
                                {
                                    selector: ".errorBinder-viewport .fieldError",
                                    mustMatch: "This value is required.",
                                    expectedElements: 1
                                }
                            ]]
                        }
                    ]
                },
                {
                    name: "Confirm that multiple errors can be set and cleared in real time...",
                    sequence: [
                        { func: "{testEnvironment}.events.constructFixtures.fire" },
                        {
                            event: "{testEnvironment}.events.onFixturesReady",
                            listener: "gpii.tests.schema.errorBinder.changeModelValue",
                            args: ["{testEnvironment}", "errorBinder", "testAllOf", "CAT"] // environment, componentName, valuePath, valueToSet
                        },
                        {
                            func: "gpii.tests.schema.errorBinder.checkElements",
                            args: [[
                                // Summary message.
                                {
                                    selector: ".errorBinder-viewport .fieldErrors",
                                    mustMatch: "The information you provided is incomplete or incorrect",
                                    expectedElements: 1
                                },
                                // Field-level validation messages.
                                {
                                    selector: ".errorBinder-viewport .fieldError",
                                    expectedElements: 2
                                }
                            ]]
                        },
                        {
                            func: "gpii.tests.schema.errorBinder.changeModelValue",
                            args: ["{testEnvironment}", "errorBinder", "testAllOf", "CAT NAP"] // environment, componentName, valuePath, valueToSet
                        },
                        {
                            func: "gpii.tests.schema.errorBinder.changeModelValue",
                            args: ["{testEnvironment}", "errorBinder", "shallowlyRequired", "There is now text."] // environment, componentName, valuePath, valueToSet
                        },
                        {
                            func: "gpii.tests.schema.errorBinder.checkElements",
                            args: [[
                                // Summary message.
                                {
                                    selector: ".errorBinder-viewport .fieldErrors",
                                    expectedElements: 0
                                },
                                // Field-level validation messages.
                                {
                                    selector: ".errorBinder-viewport .fieldError",
                                    expectedElements: 0
                                }
                            ]]
                        }
                    ]
                },
                {
                    name: "Confirm that form submission is prevented if there are validation errors...",
                    sequence: [
                        { func: "{testEnvironment}.events.constructFixtures.fire" },
                        {
                            event: "{testEnvironment}.events.onFixturesReady",
                            listener: "gpii.tests.schema.errorBinder.submitForm",
                            args: [".errorBinder-viewport form"] // selector
                        },
                        // If the page were reloaded by a form submit, we would not exist to ever finish this run.
                        {
                            func: "gpii.tests.schema.errorBinder.checkElements",
                            args: [[
                                // Summary message.
                                {
                                    selector: ".errorBinder-viewport .fieldErrors",
                                    mustMatch: "The information you provided is incomplete or incorrect",
                                    expectedElements: 1
                                },
                                // Field-level validation messages.
                                {
                                    selector: ".errorBinder-viewport .fieldError",
                                    mustMatch: "This value is required.",
                                    expectedElements: 1
                                }
                            ]]
                        }
                    ]
                },
                {
                    name: "Confirm that form submission succeeeds if there are no validation errors...",
                    sequence: [
                        { func: "{testEnvironment}.events.constructFixtures.fire" },
                        {
                            event: "{testEnvironment}.events.onFixturesReady",
                            listener: "gpii.tests.schema.errorBinder.changeModelValue",
                            args: ["{testEnvironment}", "errorBinder", "shallowlyRequired", "has a value"] // environment, componentName, valuePath, valueToSet
                        },
                        {
                            func: "gpii.tests.schema.errorBinder.submitForm",
                            args: [".errorBinder-viewport form"] // selector
                        },
                        // If the page were reloaded by a form submit, we would not exist to ever finish this run.
                        {
                            event: "{testEnvironment}.errorBinder.events.requestReceived",
                            listener: "gpii.tests.schema.errorBinder.checkElements",
                            args: [[
                                // Success message
                                {
                                    selector: ".errorBinder-viewport .templateFormControl-success",
                                    mustMatch: "Nothing can be ill.",
                                    expectedElements: 1
                                },
                                // Summary message.
                                {
                                    selector: ".errorBinder-viewport .fieldErrors",
                                    expectedElements: 0
                                },
                                // Field-level validation messages.
                                {
                                    selector: ".errorBinder-viewport .fieldError",
                                    expectedElements: 0
                                }
                            ]]
                        }
                    ]
                }
            ]
        }]
    });

    fluid.defaults("gpii.tests.schema.errorBinder.environment", {
        gradeNames: ["fluid.test.testEnvironment"],
        markupFixture: ".errorBinder-viewport",
        events: {
            constructFixtures: null,
            onFixturesReady: null
        },
        components: {
            caseHolder: {
                type: "gpii.tests.schema.errorBinder.caseHolder"
            },
            errorBinder: {
                type:      "gpii.tests.schema.errorBinder",
                createOnEvent: "constructFixtures",
                container: ".errorBinder-viewport",
                options: {
                    modelListeners: {
                        "templates": {
                            func: "{testEnvironment}.events.onFixturesReady.fire",
                            excludeSource: "init"
                        }
                    }
                }
            }
        }
    });
    fluid.test.runTests("gpii.tests.schema.errorBinder.environment");
})(fluid_3_0_0, jQuery, jqUnit);