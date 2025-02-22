import { DimItem, PluggableInventoryItemDefinition } from 'app/inventory/item-types';
import { isPluggableItem } from 'app/inventory/store/sockets';
import { useD2Definitions } from 'app/manifest/selectors';
import { modTypeTagByPlugCategoryHash } from 'app/search/specialty-modslots';
import { isEventArmorRerollSocket } from 'app/utils/socket-utils';
import { DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2';
import clsx from 'clsx';
import { PlugCategoryHashes } from 'data/d2/generated-enums';
import { pickPlugPositions } from '../mod-assignment-utils';
import Mod from './Mod';
import styles from './Sockets.m.scss';

const undesirablePlugs = [
  PlugCategoryHashes.ArmorSkinsEmpty,
  PlugCategoryHashes.Shader,
  PlugCategoryHashes.V460PlugsArmorMasterworksStatResistance1,
  PlugCategoryHashes.V460PlugsArmorMasterworksStatResistance2,
  PlugCategoryHashes.V460PlugsArmorMasterworksStatResistance3,
  PlugCategoryHashes.V460PlugsArmorMasterworksStatResistance4,
];

interface Props {
  item: DimItem;
  lockedMods?: PluggableInventoryItemDefinition[];
  size?: 'small';
  onSocketClick?(
    plugDef: PluggableInventoryItemDefinition,
    /** An allow-list of plug category hashes that can be inserted into this socket */
    // TODO: why not just pass the socketType hash or socket definition?
    plugCategoryHashWhitelist: number[]
  ): void;
}

/**
 * Show sockets (mod slots) for an armor item with the specified locked mods slotted into
 */
function Sockets({ item, lockedMods, size, onSocketClick }: Props) {
  const defs = useD2Definitions()!;
  if (!item.sockets) {
    return null;
  }

  // A list of mods to show. If we aren't showing a plug for a socket we show the empty plug.
  const modsAndWhitelist: { plugDef: PluggableInventoryItemDefinition; whitelist: number[] }[] = [];
  const modsToUse = lockedMods ? [...lockedMods] : [];

  const assignments = pickPlugPositions(defs, item, modsToUse);

  for (const socket of item.sockets?.allSockets || []) {
    const socketType = defs.SocketType.get(socket.socketDefinition.socketTypeHash);
    let toSave: DestinyInventoryItemDefinition | undefined = assignments.find(
      (a) => a.socketIndex === socket.socketIndex
    )?.mod;

    if (!toSave) {
      const plugHash =
        socket.plugged &&
        (socket.emptyPlugItemHash ||
          (socket.plugged.plugDef.plug.plugCategoryHash === PlugCategoryHashes.Intrinsics &&
            socket.plugged.plugDef.hash));
      if (plugHash) {
        toSave = defs.InventoryItem.get(plugHash);
      }
    }

    if (
      toSave &&
      isPluggableItem(toSave) &&
      !undesirablePlugs.includes(toSave.plug.plugCategoryHash) &&
      !isEventArmorRerollSocket(socket) &&
      // account for plugs that look exotic-ish but are nothings
      // but always include specialty mod slots, Vow mods don't have
      // an itemTypeDisplayName https://github.com/Bungie-net/api/issues/1620
      (toSave.itemTypeDisplayName || modTypeTagByPlugCategoryHash[toSave.plug.plugCategoryHash])
    ) {
      modsAndWhitelist.push({
        plugDef: toSave,
        whitelist: socketType.plugWhitelist.map((plug) => plug.categoryHash),
      });
    }
  }

  return (
    <div className={clsx(styles.lockedItems, { [styles.small]: size === 'small' })}>
      {modsAndWhitelist.map(({ plugDef, whitelist }, index) => (
        <Mod
          key={index}
          gridColumn={(index % 2) + 1}
          plugDef={plugDef}
          onClick={onSocketClick ? () => onSocketClick(plugDef, whitelist) : undefined}
        />
      ))}
    </div>
  );
}

export default Sockets;
