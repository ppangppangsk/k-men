import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// 이 모듈이 라우트보다 먼저 평가될 수 있으므로 여기서도 .env 를 보장한다.
// (dotenv 는 이미 설정된 실제 환경변수를 덮어쓰지 않는다)
dotenv.config();

/**
 * 업로드 루트 경로 결정.
 *
 * 우선순위
 *  1. UPLOADS_DIR  — 절대경로를 직접 지정. process.cwd() 추측을 완전히 제거한다.
 *  2. NODE_ENV=production — 앱 디렉토리 바깥(../kmen-uploads). 재배포 시 앱 디렉토리가
 *     교체되어도 업로드 파일이 남도록 하기 위함이다.
 *  3. 그 외(개발) — 프로젝트 안 ./uploads
 */
export function resolveUploadsRoot(): string {
  const explicit = process.env.UPLOADS_DIR?.trim();
  if (explicit) return path.resolve(explicit);

  return process.env.NODE_ENV === 'production'
    ? path.resolve(process.cwd(), '..', 'kmen-uploads')
    : path.join(process.cwd(), 'uploads');
}

export const uploadsRoot = resolveUploadsRoot();

function rootSource(): string {
  if (process.env.UPLOADS_DIR?.trim()) return 'UPLOADS_DIR';
  return process.env.NODE_ENV === 'production' ? 'NODE_ENV=production 기본값' : '개발 기본값';
}

export interface UploadsSubdir {
  name: string;
  fileCount: number;
  sample: string[];
}

export interface UploadsInfo {
  resolvedRoot: string;
  source: string;
  nodeEnv: string | null;
  uploadsDirEnv: string | null;
  cwd: string;
  exists: boolean;
  writable: boolean;
  totalFiles: number;
  subdirs: UploadsSubdir[];
}

/**
 * 업로드 저장소의 실제 상태를 조사한다.
 * 서버에 직접 접속하지 않고도 "어디에 저장되고 있는지"를 확인하기 위한 진단용이다.
 */
export function inspectUploads(): UploadsInfo {
  const exists = fs.existsSync(uploadsRoot);

  let writable = false;
  if (exists) {
    try {
      fs.accessSync(uploadsRoot, fs.constants.W_OK);
      writable = true;
    } catch {
      writable = false;
    }
  }

  const subdirs: UploadsSubdir[] = [];
  if (exists) {
    try {
      for (const entry of fs.readdirSync(uploadsRoot, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const dir = path.join(uploadsRoot, entry.name);
        let files: string[] = [];
        try {
          files = fs.readdirSync(dir, { withFileTypes: true })
            .filter((f) => f.isFile())
            .map((f) => f.name);
        } catch {
          // 읽을 수 없는 하위 디렉토리는 0건으로 둔다
        }
        subdirs.push({ name: entry.name, fileCount: files.length, sample: files.slice(0, 5) });
      }
    } catch {
      // 루트를 읽을 수 없으면 빈 목록
    }
  }

  return {
    resolvedRoot: uploadsRoot,
    source: rootSource(),
    nodeEnv: process.env.NODE_ENV ?? null,
    uploadsDirEnv: process.env.UPLOADS_DIR?.trim() || null,
    cwd: process.cwd(),
    exists,
    writable,
    totalFiles: subdirs.reduce((sum, d) => sum + d.fileCount, 0),
    subdirs,
  };
}

/** 기동 시 1회 출력. 업로드 경로 문제를 서버 로그만으로 진단할 수 있게 한다. */
export function logUploadsInfo(): void {
  const info = inspectUploads();
  console.log(
    `[uploads] root=${info.resolvedRoot} (source=${info.source}, NODE_ENV=${info.nodeEnv ?? '미설정'}, cwd=${info.cwd})`,
  );
  console.log(
    `[uploads] exists=${info.exists} writable=${info.writable} files=${info.totalFiles}` +
      (info.subdirs.length ? ` [${info.subdirs.map((d) => `${d.name}:${d.fileCount}`).join(', ')}]` : ''),
  );
  if (!info.exists) {
    console.warn('[uploads] 경고: 업로드 디렉토리가 존재하지 않습니다. 업로드된 파일을 서빙할 수 없습니다.');
  } else if (!info.writable) {
    console.warn('[uploads] 경고: 업로드 디렉토리에 쓰기 권한이 없습니다.');
  }
}
