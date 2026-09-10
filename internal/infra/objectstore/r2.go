package objectstore

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"strings"

	"projecttemp/internal/port"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// r2Store Cloudflare R2（S3 API）。
type r2Store struct {
	client        *s3.Client
	bucket        string
	keyPrefix     string
	publicBaseURL string
}

func newR2(opt Options) *r2Store {
	endpoint := strings.TrimRight(strings.TrimSpace(opt.Endpoint), "/")
	if endpoint == "" {
		endpoint = "https://" + strings.TrimSpace(opt.AccountID) + ".r2.cloudflarestorage.com"
	}
	client := s3.New(s3.Options{
		Region:       "auto",
		BaseEndpoint: aws.String(endpoint),
		Credentials: aws.NewCredentialsCache(
			credentials.NewStaticCredentialsProvider(opt.AccessKeyID, opt.SecretAccessKey, ""),
		),
		UsePathStyle: true,
	})
	return &r2Store{
		client:        client,
		bucket:        strings.TrimSpace(opt.Bucket),
		keyPrefix:     strings.TrimSpace(opt.KeyPrefix),
		publicBaseURL: strings.TrimRight(strings.TrimSpace(opt.PublicBaseURL), "/"),
	}
}

func (s *r2Store) PublicBase() string {
	if s == nil {
		return ""
	}
	return s.publicBaseURL
}

func (s *r2Store) Put(ctx context.Context, in port.ObjectPutInput) (string, error) {
	if s == nil || s.client == nil {
		return "", fmt.Errorf("objectstore: r2 not configured")
	}
	if in.Body == nil {
		return "", fmt.Errorf("objectstore: empty body")
	}
	ct := strings.TrimSpace(in.ContentType)
	if ct == "" {
		ct = "application/octet-stream"
	}
	name := strings.TrimSpace(in.Name)
	if name == "" {
		name = autoName(ct)
	}
	key := buildObjectKey(s.keyPrefix, in.Folder, name)

	var (
		body io.Reader
		size int64
	)
	if in.Size > 0 {
		body, size = in.Body, in.Size
	} else {
		buf, err := io.ReadAll(in.Body)
		if err != nil {
			return "", fmt.Errorf("objectstore: read body: %w", err)
		}
		body, size = bytes.NewReader(buf), int64(len(buf))
	}
	if size == 0 {
		return "", fmt.Errorf("objectstore: empty object")
	}

	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(s.bucket),
		Key:           aws.String(key),
		Body:          body,
		ContentType:   aws.String(ct),
		ContentLength: aws.Int64(size),
	})
	if err != nil {
		return "", fmt.Errorf("objectstore: r2 put: %w", err)
	}
	return s.publicBaseURL + "/" + key, nil
}
