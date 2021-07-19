import {Context} from '@actions/github/lib/context';
import {setOutput, exportVariable, getInput, debug} from '@actions/core';
import {components} from '@octokit/openapi-types';
import {CONCLUSIONS} from './constant';
import * as utils from './utils';
import {Octokit} from './utils';

type ActionsListJobsForWorkflowRunResponseData = components['schemas']['job'];

export const getJobs = async(octokit: Octokit, context: Context): Promise<Array<ActionsListJobsForWorkflowRunResponseData>> => octokit.paginate(
  octokit.rest.actions.listJobsForWorkflowRun,
  {
    ...context.repo,
    'run_id': utils.getTargetRunId(context),
  },
);

export const getJobConclusions = (jobs: Array<{ name: string; conclusion: string | null }>): Array<string> => utils.uniqueArray(
  Object.values(
    jobs
      .filter(job => null !== job.conclusion)
      .map(job => ({name: job.name, conclusion: String(job.conclusion)}))
      .reduce((acc, job) => ({...acc, [job.name]: job.conclusion}), {}),
  ),
);

// eslint-disable-next-line no-magic-numbers
export const getWorkflowConclusion = (conclusions: Array<string>): string => CONCLUSIONS.filter(conclusion => conclusions.includes(conclusion)).slice(-1)[0] ?? getInput('FALLBACK_CONCLUSION');

export const execute = async(): Promise<void> => {
  const accessToken = getInput('GITHUB_TOKEN');
  const context = new Context();
  const jobs        = await getJobs(utils.getOctokit(), context);
  debug(`Jobs in debug: '${jobs}'`);
  const conclusions = getJobConclusions(jobs);
  debug(`Conclusions in debug: '${conclusions}'`);
  const conclusion  = getWorkflowConclusion(conclusions);
  debug(`Conclusion in debug: '${conclusion}'`);

  setOutput('conclusion', conclusion);
  const envName = getInput('SET_ENV_NAME');
  if (envName) {
    exportVariable(envName, conclusion);
  }
};
