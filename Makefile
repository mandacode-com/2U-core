# Load secret or private environment variables (e.g. registry path)
-include .make.env

# Image names and tags
APP_IMAGE_NAME ?= $(REGISTRY)/2u-core
MIGRATE_IMAGE_NAME ?= $(REGISTRY)/2u-core-db-migrate
TAG ?=

# Directories
CONTEXT ?= .
MIGRATE_CONTEXT := ./prisma_migrate
PRISMA_SRC := ./prisma
PRISMA_DST := $(MIGRATE_CONTEXT)/prisma

.PHONY: all check-tag build-app build-migrate clean-prisma

# Build both images
all: check-tag build-app build-migrate

# Ensure TAG is provided
check-tag:
ifndef TAG
	$(error TAG is required. Usage: make TAG=v1.2.3)
endif

# Build app image
build-app: check-tag
	docker build -t $(APP_IMAGE_NAME):$(TAG) $(CONTEXT)

# Build migration image (includes copying prisma/)
build-migrate: check-tag
	rm -rf $(PRISMA_DST)
	cp -r $(PRISMA_SRC) $(PRISMA_DST)
	docker build -f $(MIGRATE_CONTEXT)/Dockerfile -t $(MIGRATE_IMAGE_NAME):$(TAG) $(MIGRATE_CONTEXT)

# Optional: clean copied prisma dir in migrate context
clean-prisma:
	rm -rf $(PRISMA_DST)
