import { motion } from 'framer-motion';
import { ChevronRightSquare } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';

import { NAV_ITEMS } from '../entities';
import './side-bar.scss';

export const SideBar: React.FC = () => {
  const [isCollapsed, setCollapsed] = useState(true);

  const cls = useMemo(
    () => `SideBar ${isCollapsed ? 'SideBar--collapsed' : 'SideBar--expanded'}`,
    [isCollapsed],
  );

  return (
    <motion.aside
      className={cls}
      /* ширина и лёгкий слайд — приятнее */
      initial={{ x: -16, opacity: 0, width: 64 }}
      animate={{
        x: 0,
        opacity: 1,
        width: isCollapsed ? 64 : 288,
      }}
      transition={{
        type: 'spring',
        stiffness: 320,
        damping: 28,
      }}
    >
      <div className="SideBar__wr">
        {/* Верхняя кнопка */}
        <div className="SideBar__gr1">
          <div
            className="row"
            role="button"
            aria-label="Переключить боковую панель"
            onClick={() => setCollapsed((v) => !v)}
          >
            <motion.span
              style={{ display: 'inline-flex' }}
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={{ type: 'tween', duration: 0.2 }}
            >
              <ChevronRightSquare />
            </motion.span>

            <span className="row__label">Закрыть боковую панель</span>
          </div>
        </div>

        {/* Нижние пункты — фиксированная высота строк, без прыжков */}
        <div className="SideBar__gr2">
          {NAV_ITEMS.map(({ icon: Icon, label, url }) => (
            <NavLink
              className={({ isActive }) => (isActive ? 'active row ' : 'row')}
              key={label}
              to={url}
            >
              <Icon />
              <span className="row__label">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </motion.aside>
  );
};
