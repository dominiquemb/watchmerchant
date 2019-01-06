set -e

# Remove when dockerfile is updated!
# apk add --update bash git zip autoconf file zlib-dev musl automake nasm libjpeg-turbo libjpeg-turbo-dev libpng libpng-dev

if [ -z "$1" ]; then
    echo "No environment specified"
    exit 1
fi

app_name=wmuk-portal
# version_name=$(date +"%Y-%m-%d_%H-%M-%S")
version_name=$(git tag -l --points-at HEAD)
bundle_name=app-${version_name}.zip
deployment_bucket=elasticbeanstalk-eu-west-1-083051135889

npm install
gulp build

git archive -o $bundle_name HEAD
zip -ur $bundle_name public/
echo "Uploading bundle to S3: ${AWS_ACCESS_KEY_ID}"
aws s3 cp $bundle_name s3://$deployment_bucket
aws elasticbeanstalk create-application-version \
    --application-name $app_name \
    --version-label $version_name \
    --source-bundle S3Bucket=$deployment_bucket,S3Key=${bundle_name}
aws elasticbeanstalk update-environment \
    --application-name $app_name \
    --environment-name $1 \
    --version-label $version_name

echo "Deployment of $version_name to $1 succeeded. Expect Elastic Beanstalk to take a couple of minutes to catch up." | bash ./deployment/slacktee.sh
