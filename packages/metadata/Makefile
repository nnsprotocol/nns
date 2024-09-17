FILE_TEMPLATE = infrastructure.yml
FILE_PACKAGE = infrastructure-packaged.yml
AWS_BUCKET_NAME = sam-deployments-packages-us-east-1
BUCKET_PREFIX = nns-metadata-v2
AWS_REGION = us-east-1
AWS_STACK_NAME = nns-metadata-v2

build:
	@yarn build

package:
	@sam package \
		--template-file $(FILE_TEMPLATE) \
		--s3-bucket $(AWS_BUCKET_NAME) \
		--s3-prefix $(BUCKET_PREFIX) \
		--region "$(AWS_REGION)" \
		--output-template-file $(FILE_PACKAGE)

deploy:
	@sam deploy \
		--template-file $(FILE_PACKAGE) \
		--region $(AWS_REGION) \
		--capabilities CAPABILITY_IAM \
		--stack-name $(AWS_STACK_NAME)

pipeline: build package deploy