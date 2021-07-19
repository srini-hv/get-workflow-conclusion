"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.getWorkflowConclusion = exports.getJobConclusions = exports.getJobs = exports.getTargetRunId = exports.getOctokit = exports.getAccessToken = exports.uniqueArray = void 0;
const context_1 = require("@actions/github/lib/context");
const core_1 = require("@actions/core");
const constant_1 = require("./constant");
const github_1 = require("@actions/github");
const uniqueArray = (array) => [...new Set(array)];
exports.uniqueArray = uniqueArray;
const getAccessToken = (required) => core_1.getInput('GITHUB_TOKEN', { required });
exports.getAccessToken = getAccessToken;
const getOctokit = (token) => github_1.getOctokit(token !== null && token !== void 0 ? token : exports.getAccessToken(true), {});
exports.getOctokit = getOctokit;
const getTargetRunId = (context) => /^\d+$/.test(core_1.getInput('TARGET_RUN_ID')) ? Number(core_1.getInput('TARGET_RUN_ID')) : context.runId;
exports.getTargetRunId = getTargetRunId;
const getJobs = async (octokit, context) => octokit.paginate(octokit.rest.actions.listJobsForWorkflowRun, {
    ...context.repo,
    'run_id': exports.getTargetRunId(context),
});
exports.getJobs = getJobs;
const getJobConclusions = (jobs) => exports.uniqueArray(Object.values(jobs
    .filter(job => null !== job.conclusion)
    .map(job => ({ name: job.name, conclusion: String(job.conclusion) }))
    .reduce((acc, job) => ({ ...acc, [job.name]: job.conclusion }), {})));
exports.getJobConclusions = getJobConclusions;
// eslint-disable-next-line no-magic-numbers
const getWorkflowConclusion = (conclusions) => { var _a; return (_a = constant_1.CONCLUSIONS.filter(conclusion => conclusions.includes(conclusion)).slice(-1)[0]) !== null && _a !== void 0 ? _a : core_1.getInput('FALLBACK_CONCLUSION'); };
exports.getWorkflowConclusion = getWorkflowConclusion;
const execute = async () => {
    const accessToken = core_1.getInput('GITHUB_TOKEN');
    const context = new context_1.Context();
    //const octokit = github.getOctokit(accessToken);
    // const octokit = new github.GitHub(accessToken)
    //const octokit = github.getOctokit(accessToken)
    // const getOctokit = (token?: string): Octokit => getOctokitInstance(token ?? accessToken, {}) as Octokit;
    const jobs = await exports.getJobs(exports.getOctokit(), context);
    core_1.debug(`Jobs in debug: '${jobs}'`);
    const conclusions = exports.getJobConclusions(jobs);
    core_1.debug(`Conclusions in debug: '${conclusions}'`);
    const conclusion = exports.getWorkflowConclusion(conclusions);
    core_1.debug(`Conclusion in debug: '${conclusion}'`);
    core_1.setOutput('conclusion', conclusion);
    const envName = core_1.getInput('SET_ENV_NAME');
    if (envName) {
        core_1.exportVariable(envName, conclusion);
    }
};
exports.execute = execute;
