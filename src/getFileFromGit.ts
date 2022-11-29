import child_process from 'child_process';

export function getFileFromGit(
  branch: string,
  filepath: string,
): Promise<string> {
  return new Promise((res, rej) => {
    child_process.exec(
      `git show ${branch}:${filepath}`,
      (err, stdout, stderr) => {
        if (err) {
          rej(err);
        } else if (stderr) {
          rej(stderr);
        } else {
          res(stdout);
        }
      },
    );
  });
}
