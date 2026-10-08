/**
 * 文件职责：在新面试中选择当前账号仓库的一份简历。
 * 关联文件：components/InterviewSimulator.js、lib/client/resumeApi.js。
 * 注意事项：仅返回选择结果，输入覆盖及旧面试状态清理由主面试组件处理。
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { listResumes } from '../lib/client/resumeApi';

export default function ResumePicker({ disabled, onSelect, onCancelImport }) {
  const dialogRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [resumes, setResumes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const handleOpen = async () => {
    setIsOpen(true);
    setError('');
    setIsLoading(true);
    try {
      setResumes(await listResumes());
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async (item) => {
    setSelectedId(item.id);
    setError('');
    try {
      const applied = await onSelect(item.id);
      if (applied) setIsOpen(false);
      else setError('导入已取消，因为简历输入在读取期间发生了变化。');
    } catch (selectionError) {
      setError(selectionError.message);
    } finally {
      setSelectedId('');
    }
  };

  const handleClose = () => {
    onCancelImport();
    setIsOpen(false);
  };

  return (
    <>
      <button type="button" className="secondary-button compact-button" disabled={disabled} onClick={handleOpen}>从简历仓库选择</button>
      <dialog className="resume-picker-dialog" ref={dialogRef} onCancel={onCancelImport} onClose={() => setIsOpen(false)} aria-labelledby="resume-picker-title">
        <div className="resume-picker-header">
          <div><p className="category">简历仓库</p><h2 id="resume-picker-title">选择一份简历</h2></div>
          <button type="button" className="secondary-button compact-button" onClick={handleClose}>关闭</button>
        </div>
        {error && <p className="resume-feedback resume-feedback-error" role="alert">{error}</p>}
        {isLoading && <p className="empty-state">正在读取简历…</p>}
        {!isLoading && !error && resumes.length === 0 && (
          <div className="resume-picker-empty">
            <p>仓库里还没有简历。</p>
            <a className="text-link" href="/interview/resumes">前往简历仓库</a>
          </div>
        )}
        {!isLoading && resumes.length > 0 && (
          <ul className="resume-picker-list">
            {resumes.map((item) => (
              <li key={item.id}>
                <span className="resume-file-icon" aria-hidden="true">{item.file_type.toUpperCase()}</span>
                <span className="resume-file-info"><strong>{item.original_name}</strong><span>{new Date(item.created_at).toLocaleDateString('zh-CN')}</span></span>
                <button type="button" className="compact-button" disabled={Boolean(selectedId)} onClick={() => handleSelect(item)}>
                  {selectedId === item.id ? '读取中…' : '使用'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </dialog>
    </>
  );
}
