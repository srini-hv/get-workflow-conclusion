"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.getWorkflowConclusion = exports.getJobConclusions = exports.getJobs = void 0;
const context_1 = require("@actions/github/lib/context");
const core_1 = require("@actions/core");
const constant_1 = require("./constant");
const utils = __importStar(require("./utils"));
const getJobs = async (octokit, context) => octokit.paginate(octokit.rest.actions.listJobsForWorkflowRun, {
    ...context.repo,
    'run_id': utils.getTargetRunId(context),
});
exports.getJobs = getJobs;
const getJobConclusions = (jobs) => utils.uniqueArray(Object.values(jobs
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
    const jobs = await exports.getJobs(utils.getOctokit(), context);
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
