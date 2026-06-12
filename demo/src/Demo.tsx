import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import frames from './frames.json';

const MONO = 'Menlo, Monaco, "Courier New", monospace';
const VIDEO_FPS = 3; // the statusline video's native frame rate

// One vidline frame: rows of [topColor, bottomColor] cells rendered as
// CSS half-block gradients — pixel-identical to the terminal output.
const AnsiVideo = ({frameIndex, cellW}: {frameIndex: number; cellW: number}) => {
  const grid = frames[frameIndex % frames.length] as string[][][];
  return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      {grid.map((row, y) => (
        <div key={y} style={{display: 'flex', height: cellW * 2}}>
          {row.map(([top, bottom], x) => (
            <div
              key={x}
              style={{
                width: cellW,
                background: `linear-gradient(to bottom, ${top} 0 50%, ${bottom} 50% 100%)`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const SPINNER = ['✻', '✼', '✽', '✼'];

export const Demo = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = Math.floor(frame / fps);
  const videoFrame = Math.floor((frame / fps) * VIDEO_FPS);
  const spinner = SPINNER[Math.floor(frame / 8) % SPINNER.length];
  const cursorOn = frame % 30 < 18;
  // the bit escalates halfway through
  const verb = seconds < 10 ? 'Discombobulating…' : 'Recombobulating…';
  const agents = 41 + Math.floor(seconds / 3);

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #2a2139 0%, #14101e 100%)',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: 880,
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          background: '#1a1a1a',
          fontFamily: MONO,
          fontSize: 15,
          lineHeight: 1.5,
        }}
      >
        {/* title bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            background: '#2d2d2d',
          }}
        >
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c}} />
          ))}
          <div style={{flex: 1, textAlign: 'center', color: '#999', fontSize: 13}}>
            claude — ~/vid-line
          </div>
        </div>

        <div style={{padding: '18px 24px 20px'}}>
          {/* transcript */}
          <div style={{color: '#888'}}>
            <span style={{color: '#c678dd'}}>&gt;</span> port the entire compiler to rust
          </div>
          <div style={{color: '#aaa', marginTop: 8}}>
            <span style={{color: '#e5a458'}}>{spinner}</span>{' '}
            <span style={{color: '#e5a458'}}>{verb}</span>{' '}
            <span style={{color: '#777'}}>({847 + seconds}s · {agents} agents · esc to interrupt)</span>
          </div>

          {/* input box */}
          <div
            style={{
              marginTop: 14,
              border: '1px solid #4a4a4a',
              borderRadius: 6,
              padding: '8px 12px',
              color: '#ddd',
            }}
          >
            &gt;{' '}
            <span
              style={{
                display: 'inline-block',
                width: 9,
                height: 18,
                verticalAlign: 'text-bottom',
                background: cursorOn ? '#ddd' : 'transparent',
              }}
            />
          </div>

          {/* the statusline: THE VIDEO */}
          <div style={{marginTop: 14}}>
            <AnsiVideo frameIndex={videoFrame} cellW={13} />
            <div style={{marginTop: 8, fontSize: 14}}>
              <span style={{color: '#777'}}>🎬</span>{' '}
              <span style={{color: '#56b6c2'}}>Fable 5</span>
              <span style={{color: '#777'}}> · vid-line · ctx 42% · $1.23</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{marginTop: 28, color: '#b8a8d8', fontFamily: MONO, fontSize: 20}}>
        vid-line — videos in your Claude Code statusline
      </div>
    </AbsoluteFill>
  );
};
