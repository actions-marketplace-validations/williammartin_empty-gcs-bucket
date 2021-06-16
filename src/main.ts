import * as core from "@actions/core";
import { Storage } from "@google-cloud/storage";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as IOEither from "fp-ts/lib/IOEither";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import * as t from "io-ts";
import { failure } from "io-ts/PathReporter";

const ParsedCredentials = t.type({
  type: t.string,
  project_id: t.string,
  private_key_id: t.string,
  private_key: t.string,
  client_email: t.string,
  client_id: t.string,
  auth_uri: t.string,
  token_uri: t.string,
  auth_provider_x509_cert_url: t.string,
  client_x509_cert_url: t.string,
});
type ParsedCredentials = t.TypeOf<typeof ParsedCredentials>;

// Utility to convert caught "things" of unknown shape into Errors
const unknownReasonAsError = (reason: unknown) =>
  reason instanceof Error ? reason : new Error(String(reason));

// Parse JSON into Either
const safeParseJSON = E.tryCatchK(JSON.parse, unknownReasonAsError);

// IO wrapper around loading GitHub Actions Inputs
// which load from Environment Variables
const safeGetInput = (input: string) =>
  IOEither.tryCatch(
    () => core.getInput(input, { required: true }),
    unknownReasonAsError,
  );

const parseCredentials = (serialisedMaybeCredentials: string) =>
  pipe(
    serialisedMaybeCredentials,
    safeParseJSON,
    E.chainW(ParsedCredentials.decode),
    E.mapLeft(
      (e) =>
        new Error(
          `failed to parse credentials because: ${
            e instanceof Error ? e : failure(e).join("\n")
          }`,
        ),
    ),
  );

// Wrapper around creating Google Cloud Storage client
const createStorage = (credentials: ParsedCredentials) => {
  return new Storage({
    userAgent: "delete-gcs-bucket-contents/0.0.1",
    credentials,
  });
};

// Empty the Bucket
const emptyBucket = (storage: Storage) => (bucket: string) =>
  pipe(
    bucket,
    TE.tryCatchK(
      (bucket: string) => storage.bucket(bucket).deleteFiles(),
      unknownReasonAsError,
    ),
  );

const run: TE.TaskEither<Error, void> = pipe(
  safeGetInput("credentials"),
  IOEither.chainEitherK(parseCredentials),
  IOEither.map(createStorage),
  TE.fromIOEither,
  TE.bindTo("storage"),
  TE.bind("bucket", () => pipe(safeGetInput("bucket"), TE.fromIOEither)),
  TE.chain(({ storage, bucket }) => emptyBucket(storage)(bucket)),
);

run().then(
  E.fold(
    (error) => {
      console.error(error);
    },
    () => {
      console.log("Completed successfully");
    },
  ),
);
