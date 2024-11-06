FILE_TEMPLATE = aws.yml
FILE_PACKAGE = aws-packaged.yml
AWS_BUCKET_NAME = sam-deployments-packages
BUCKET_PREFIX = nns-api
AWS_REGION = "eu-west-1"
AWS_STACK_NAME = nns-api


build:
	@sam build \
		--template-file $(FILE_TEMPLATE)

deploy-%:
	@sam deploy \
		--template-file ".aws-sam/build/template.yaml" \
		--region $(AWS_REGION) \
		--capabilities CAPABILITY_IAM \
		--s3-bucket $(AWS_BUCKET_NAME) \
		--s3-prefix "$(BUCKET_PREFIX)-$*" \
		--stack-name "$(AWS_STACK_NAME)-$*" \
		--parameter-overrides 'Network=$*' 'Timestamp=$(shell date +%s)'

pipeline-sepolia: build deploy-sepolia
pipeline-mainnet: build deploy-mainnet