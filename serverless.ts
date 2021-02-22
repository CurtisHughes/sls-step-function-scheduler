import type { AWS } from "@serverless/typescript";
import { calculator, task } from "./src/functions";
import stepFunctionSchedulerLambdaTask from "./src/resources/step-function-scheduler-lambda-task.json";

const serverlessConfiguration: AWS = {
  service: "sls-step-function-scheduler",
  frameworkVersion: "2",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
    },
  },
  plugins: ["serverless-webpack"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
    },
    lambdaHashingVersion: "20201221",
  },
  functions: { calculator, task },
  resources: {
    Resources: {
      LambdaTaskStateMachine: {
        Type: "AWS::StepFunctions::StateMachine",
        DependsOn: ["LambdaTaskStateMachineIAMRole"],
        Properties: {
          StateMachineName: "sls-step-function-scheduler-${opt:stage, self:provider.stage, 'dev'}-lambda-task-state-machine",
          StateMachineType: "STANDARD",
          DefinitionString: JSON.stringify(stepFunctionSchedulerLambdaTask),
          RoleArn: {
            "Fn::Join": [
              ":",
              [
                "arn:aws:iam:",
                { Ref: "AWS::AccountId" },
                "role/sls-step-function-scheduler-${opt:stage, self:provider.stage, 'dev'}-lambda-task-state-machine-role",
              ],
            ],
          },
          DefinitionSubstitutions: {
            CalculatorFunctionName: "sls-step-function-scheduler-${opt:stage, self:provider.stage, 'dev'}-calculator",
            TaskFunctionName: "sls-step-function-scheduler-${opt:stage, self:provider.stage, 'dev'}-task",
          },
        },
      },
      LambdaTaskStateMachineIAMRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          RoleName: "sls-step-function-scheduler-${opt:stage, self:provider.stage, 'dev'}-lambda-task-state-machine-role",
          AssumeRolePolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Principal: {
                  Service: "states.amazonaws.com",
                },
                Action: "sts:AssumeRole",
              },
            ],
          },
          Policies: [
            {
              PolicyName: "StepFunctionStartExecutionFullAccessPolicy",
              PolicyDocument: {
                Version: "2012-10-17",
                Statement: [
                  {
                    Effect: "Allow",
                    Action: ["states:StartExecution"],
                    Resource: "*",
                  },
                ],
              },
            },
            {
              PolicyName: "StepFunctionInvokeLambdas",
              PolicyDocument: {
                Version: "2012-10-17",
                Statement: [
                  {
                    Effect: "Allow",
                    Action: ["lambda:InvokeFunction"],
                    Resource: [
                      {
                        "Fn::Join": [
                          ":",
                          [
                            "arn:aws:lambda",
                            { Ref: "AWS::Region" },
                            { Ref: "AWS::AccountId" },
                            "function",
                            "sls-step-function-scheduler-${opt:stage, self:provider.stage, 'dev'}-calculator",
                            "*",
                          ],
                        ],
                      },
                      {
                        "Fn::Join": [
                          ":",
                          [
                            "arn:aws:lambda",
                            { Ref: "AWS::Region" },
                            { Ref: "AWS::AccountId" },
                            "function",
                            "sls-step-function-scheduler-${opt:stage, self:provider.stage, 'dev'}-task",
                            "*",
                          ],
                        ],
                      },
                    ],
                  },
                  {
                    Effect: "Allow",
                    Action: ["lambda:InvokeFunction"],
                    Resource: [
                      {
                        "Fn::Join": [
                          ":",
                          [
                            "arn:aws:lambda",
                            { Ref: "AWS::Region" },
                            { Ref: "AWS::AccountId" },
                            "function",
                            "sls-step-function-scheduler-${opt:stage, self:provider.stage, 'dev'}-calculator",
                          ],
                        ],
                      },
                      {
                        "Fn::Join": [
                          ":",
                          [
                            "arn:aws:lambda",
                            { Ref: "AWS::Region" },
                            { Ref: "AWS::AccountId" },
                            "function",
                            "sls-step-function-scheduler-${opt:stage, self:provider.stage, 'dev'}-task",
                          ],
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
