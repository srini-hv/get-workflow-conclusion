import {Context} from '@actions/github/lib/context';
import {setOutput, exportVariable, getInput, debug} from '@actions/core';
import {components} from '@octokit/openapi-types';
import {CONCLUSIONS} from './constant';
import {getOctokit as getOctokitInstance} from '@actions/github';
import {GitHub} from '@actions/github/lib/utils';
import {RestEndpointMethods} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types';


type ActionsListJobsForWorkflowRunResponseData = components['schemas']['job'];

export const uniqueArray = <T>(array: T[]): T[] => [...new Set<T>(array)];

export type Octokit = InstanceType<typeof GitHub> & { rest: RestEndpointMethods; };

export const getAccessToken = (required: boolean): string => getInput('GITHUB_TOKEN', {required});

export const getOctokit = (token?: string): Octokit => getOctokitInstance(token ?? getAccessToken(true), {}) as Octokit;

export const getTargetRunId = (context: Context): number => /^\d+$/.test(getInput('TARGET_RUN_ID')) ? Number(getInput('TARGET_RUN_ID')) : context.runId;

export const getJobs = async(octokit: Octokit, context: Context): Promise<Array<ActionsListJobsForWorkflowRunResponseData>> => octokit.paginate(
  octokit.rest.actions.listJobsForWorkflowRun,
  {
    ...context.repo,
    'run_id': getTargetRunId(context),
  },
);

export const getJobConclusions = (jobs: Array<{ name: string; conclusion: string | null }>): Array<string> => uniqueArray(
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
  //const octokit = github.getOctokit(accessToken);
  // const octokit = new github.GitHub(accessToken)
  //const octokit = github.getOctokit(accessToken)
  // const getOctokit = (token?: string): Octokit => getOctokitInstance(token ?? accessToken, {}) as Octokit;
  const jobs        = await getJobs(getOctokit(), context);
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
