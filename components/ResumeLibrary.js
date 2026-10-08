/**
 * 文件职责：展示简历仓库的上传、列表、原文件下载和删除交互。
 * 关联文件：app/interview/resumes/page.js、lib/client/resumeApi.js。
 * 注意事项：列表只展示当前账号的云端文件；本组件不保存文件到浏览器存储。
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { deleteResume, downloadResume, listResumes, uploadResume } from '../lib/client/resumeApi';
import { getInterviewImportKind, getInterviewImportValidationError, IMPORT_FILE_ACCEPT } from '../lib/client/interviewFileImport';

function formatSize(size) {
  return size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default function ResumeLibrary() {
  const fileInputRef = useRef(null);
  const deleteDialogRef = useRef(null);
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    listResumes().then((items) => {
      if (active) setResumes(items);
    }).catch((loadError) => {
      if (active) { setError(loadError.message); setLoadFailed(true); }
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const dialog = deleteDialogRef.current;
    if (deleteTarget && !dialog.open) dialog.showModal();
    if (!deleteTarget && dialog.open) dialog.close();
  }, [deleteTarget]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    setMessage('');
    const kind = getInterviewImportKind(file);
    const validationError = getInterviewImportValidationError(file, kind);
    if (validationError) { setError(validationError); return; }
    if (resumes.length >= 10) { setError('简历仓库最多保存 10 份，请先删除一份。'); return; }
    setIsUploading(true);
    try {
      await uploadResume(file);
      setResumes(await listResumes());
      setLoadFailed(false);
      setMessage('简历已保存到仓库。');
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (item) => {
    setBusyId(item.id);
    setError('');
    try {
      const blob = await downloadResume(item.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = item.original_name;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (downloadError) {
      setError(downloadError.message);
    } finally {
      setBusyId('');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    setError('');
    try {
      await deleteResume(deleteTarget.id);
      setResumes((items) => items.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      setMessage('简历已删除。');
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusyId('');
    }
  };

  return (
    <>
      <section className="panel resume-upload-panel">
        <div>
          <p className="category">我的文件</p>
          <h2>保存常用简历</h2>
          <p className="subtitle">支持 PDF、DOCX、TXT 和 MD。文件会保存在你的账号中，可在新面试时选用。</p>
        </div>
        <div className="resume-upload-actions">
          <span className="resume-count" aria-live="polite">{isLoading ? '正在读取' : `${resumes.length} / 10 份`}</span>
          <button type="button" disabled={isLoading || isUploading || resumes.length >= 10} onClick={() => fileInputRef.current?.click()}>
            {isUploading ? '正在上传…' : '上传简历'}
          </button>
          <input ref={fileInputRef} className="file-input-hidden" type="file" accept={IMPORT_FILE_ACCEPT} onChange={handleFileChange} />
        </div>
      </section>

      {error && <p className="resume-feedback resume-feedback-error" role="alert">{error}</p>}
      {message && <p className="resume-feedback" role="status">{message}</p>}

      <section className="resume-list-section" aria-label="已保存简历">
        <div className="resume-list-heading"><h2>已保存简历</h2><span>按上传时间排序</span></div>
        {isLoading && <div className="panel resume-empty">正在读取简历…</div>}
        {!isLoading && !loadFailed && resumes.length === 0 && <div className="panel resume-empty">还没有保存的简历。上传一份后，就能在新面试中直接选用。</div>}
        {!isLoading && resumes.length > 0 && (
          <ul className="resume-list">
            {resumes.map((item) => (
              <li className="panel resume-list-item" key={item.id}>
                <span className="resume-file-icon" aria-hidden="true">{item.file_type.toUpperCase()}</span>
                <div className="resume-file-info">
                  <strong>{item.original_name}</strong>
                  <span>{formatSize(item.size_bytes)} · {new Date(item.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
                <div className="resume-file-actions">
                  <button className="secondary-button compact-button" type="button" disabled={Boolean(busyId)} onClick={() => handleDownload(item)}>下载</button>
                  <button className="resume-delete-button compact-button" type="button" disabled={Boolean(busyId)} onClick={() => setDeleteTarget(item)}>删除</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <dialog className="resume-confirm-panel" ref={deleteDialogRef} onClose={() => setDeleteTarget(null)} aria-labelledby="resume-delete-title">
        {deleteTarget && (
          <>
            <h2 id="resume-delete-title">删除这份简历？</h2>
            <p>“{deleteTarget.original_name}”将从云端仓库移除，已保存的面试历史不会改变。</p>
            <div className="button-row">
              <button className="secondary-button" type="button" disabled={Boolean(busyId)} onClick={() => setDeleteTarget(null)}>取消</button>
              <button className="danger-button" type="button" disabled={Boolean(busyId)} onClick={handleDelete}>{busyId ? '正在删除…' : '确认删除'}</button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
