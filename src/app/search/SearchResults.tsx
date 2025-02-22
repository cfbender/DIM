import ClickOutsideRoot from 'app/dim-ui/ClickOutsideRoot';
import { t } from 'app/i18next-t';
import ConnectedInventoryItem from 'app/inventory/ConnectedInventoryItem';
import DraggableInventoryItem from 'app/inventory/DraggableInventoryItem';
import ItemPopupTrigger from 'app/inventory/ItemPopupTrigger';
import clsx from 'clsx';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import Sheet from '../dim-ui/Sheet';
import { DimItem } from '../inventory/item-types';
import { itemSorterSelector } from '../settings/item-sort';
import styles from './SearchResults.m.scss';

/**
 * This displays all the items that match the given search - it is shown by default when a search is active
 * on mobile, and as a sheet when you hit "enter" on desktop.
 */
export default memo(function SearchResults({
  items,
  onClose,
}: {
  items: DimItem[];
  onClose(): void;
}) {
  const sortItems = useSelector(itemSorterSelector);

  const header = (
    <div>
      <h1 className={styles.header}>{t('Header.FilterMatchCount', { count: items.length })}</h1>
    </div>
  );

  // TODO: actions footer?
  // TODO: categories?
  return (
    <Sheet
      onClose={onClose}
      header={header}
      sheetClassName={clsx('item-picker', styles.searchResults)}
      allowClickThrough={true}
    >
      <ClickOutsideRoot>
        <div className={clsx('sub-bucket', styles.contents)}>
          {sortItems(items).map((item) => (
            <DraggableInventoryItem key={item.index} item={item}>
              <ItemPopupTrigger item={item} key={item.index}>
                {(ref, onClick) => (
                  <ConnectedInventoryItem item={item} innerRef={ref} onClick={onClick} />
                )}
              </ItemPopupTrigger>
            </DraggableInventoryItem>
          ))}
        </div>
      </ClickOutsideRoot>
    </Sheet>
  );
});
