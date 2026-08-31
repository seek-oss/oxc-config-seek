import { useState, useEffect } from 'react';

export const Bad = ({ items }: { items: string[] }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(items.length);
  }, []);

  return (
    <div class="wrong">
      {items.map((item) => (
        <span>{item}</span>
      ))}
      <br></br>
    </div>
  );
};
