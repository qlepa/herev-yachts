import type { ComponentType } from 'react';
import type { StringInputProps } from 'sanity';

/** Text input with a "23 / 60" character counter under it. */
export function withCharCount(max: number): ComponentType<StringInputProps> {
  return function CharCountInput(props: StringInputProps) {
    const length = props.value?.length ?? 0;
    const over = length > max;
    return (
      <div>
        {props.renderDefault(props)}
        <div
          style={{
            marginTop: 6,
            fontSize: 13,
            textAlign: 'right',
            color: over ? '#e5484d' : 'inherit',
            opacity: over ? 1 : 0.6,
          }}
        >
          {length} / {max} znaków
        </div>
      </div>
    );
  };
}
