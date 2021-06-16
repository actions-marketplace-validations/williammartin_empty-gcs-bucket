# empty-gcs-pucket

This action deletes all files and folders in a [Google Cloud Storage (GCS)][gcs] bucket.

**WARNING**: THIS ACTION DELETES ALL FILES AND FOLDERS IN A [GOOGLE CLOUD STORAGE (GCS)][gcs] BUCKET! NO CONFIRMS. NO DRY RUNS. GONE!

## Prerequisites

- This action requires Google Cloud credentials that are authorized to upload
  blobs to the specified bucket. See the Authorization section below for more
  information.

## Usage

### For emptying a bucket

```yaml
steps:
  - id: empty-bucket
    uses: williammartin/empty-gcs-bucket@main
    with:
      bucket: bucket-name
      credentials: ${{ secrets.gcp_credentials }}
```

This will delete all contents of `gs://bucket-name`

## Inputs

- `bucket`: (Required) The name of the bucket to empty.

  ```yaml
  destination: bucket-name
  ```

  In the above example, the bucket emptied will be `gs://bucket-name`

- `credentials`: (Required) [Google Service Account JSON][sa] credentials as JSON,
  typically sourced from a [GitHub Secret][gh-secret].

## Outputs

There are no outputs.

## Authorization

There are a few ways to authenticate this action. The caller must have
permissions to access the secrets being requested.

### Via credentials

You must provide [Google Cloud Service Account JSON][sa] directly to the action
by specifying the `credentials` input. First, create a [GitHub
Secret][gh-secret] that contains the JSON content, then import it into the
action:

```yaml
steps:
  - id: empty-bucket
    uses: williammartin/empty-gcs-bucket@main
    with:
      bucket: bucket-name
      credentials: ${{ secrets.gcp_credentials }}
```

### Via the setup-gcloud action

This is unsupported, but we could add it if anyone cared.

### Via Application Default Credentials

This is unsupported, but we could add it if anyone cared.

[gcs]: https://cloud.google.com/storage
[sa]: https://cloud.google.com/iam/docs/creating-managing-service-accounts
[gh-secret]: https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets
