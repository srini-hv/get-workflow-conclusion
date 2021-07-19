import {getOctokit as getOctokitInstance} from '@actions/github';
import {GitHub} from '@actions/github/lib/utils';
import {RestEndpointMethods} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types';
import {getInput} from '@actions/core';
import {Context} from '@actions/github/lib/context';

export const uniqueArray = <T>(array: T[]): T[] => [...new Set<T>(array)];

export type Octokit = InstanceType<typeof GitHub> & { rest: RestEndpointMethods; };

export const getAccessToken = (required: boolean): string => getInput('GITHUB_TOKEN', {required});

export const getOctokit = (token?: string): Octokit => getOctokitInstance(token ?? getAccessToken(true), {}) as Octokit;

export const getTargetRunId = (context: Context): number => /^\d+$/.test(getInput('TARGET_RUN_ID')) ? Number(getInput('TARGET_RUN_ID')) : context.runId;