'use client';

import React, { useState, useRef, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  UploadedImage,
  GenerationUIStatus,
  GenerateApiRequest,
  GenerateApiResponse,
  GenerationDocument
} from '@/types/generation';
import { STYLE_PRESETS } from '../constants/styles';

import ProductSection from '../components/ProductSection';
import StyleSection from '../components/StyleSection';
import AspectRatioSection from '../components/AspectRatioSection';
import TextSection from '../components/TextSection';
import InspirationSection from '../components/InspirationSection';
import GenerationLoadingState from '../components/GenerationLoadingState';

// Rest of the file content remains exactly the same as the original generate/page.tsx
// ... existing code ... 