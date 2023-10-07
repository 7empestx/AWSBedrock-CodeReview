// @ts-ignore
import * as core from '@aws/codecatalyst-adk-core';
// @ts-ignore
import * as project from '@aws/codecatalyst-project';
// @ts-ignore
import * as runSummaries from '@aws/codecatalyst-run-summaries';
// @ts-ignore
import * as space from '@aws/codecatalyst-space';

try {
    // Get inputs from the action
    const input_WhoToGreet = core.getInput('WhoToGreet'); // Who are we greeting here
    console.log(input_WhoToGreet);
    const input_HowToGreet = core.getInput('HowToGreet'); // How to greet the person
    console.log(input_HowToGreet);

    // Interact with CodeCatalyst entities
    console.log(`Current CodeCatalyst space ${space.getSpace().name}`);
    console.log(`Current CodeCatalyst project ${project.getProject().name}`);

    // Action Code start

    // Set outputs of the action
} catch (error) {
    core.setFailed(`Action Failed, reason: ${error}`);
}
