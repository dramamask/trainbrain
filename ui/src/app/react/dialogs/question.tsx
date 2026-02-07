"use client";

import { useSyncExternalStore } from 'react';
import { Box, Button } from '@mui/material';
import { store as questionStore, NO, YES } from '@/app/services/stores/question';

import styles from "./question.module.css";

export default function OkCancel() {
  // This hook automatically subscribes and returns the latest snapshot
  const state = useSyncExternalStore(questionStore.subscribe, questionStore.getSnapshot, questionStore.getServerSnapshot);

  const handleClose = () => {
    questionStore.clear();
  };

  const handleAnswer = (answer: boolean) => {
    questionStore.setAnswer(answer);
    questionStore.clear();
  };

  if (state.question) {
    return (
      <div className={styles.body}>
        {state.question}
        <div
          className={styles.closeButton}
          onClick={handleClose}
        >
          &times;
        </div>
        <Box display="flex" justifyContent="flex-end">
          <Button className={styles.answer} variant="outlined" onClick={() => handleAnswer(YES)}>Yes</Button>
          <Button className={styles.answer} variant="outlined" onClick={() => handleAnswer(NO)}>No</Button>
        </Box>
      </div>
    )
  }

  return null
}
