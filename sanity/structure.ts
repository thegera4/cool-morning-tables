import type { StructureResolver } from 'sanity/structure'
import { BasketIcon } from "@sanity/icons";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      // Custom Order Item with Filters
      S.listItem()
        .title('Ordenes')
        .icon(BasketIcon)
        .child(
          S.list()
            .title('Ordenes')
            .items([
              S.documentTypeListItem('order').title('Todas las Ordenes'),
              S.divider(),
              S.listItem()
                .title('Por Estatus')
                .child(
                  S.list()
                    .title('Ordenes por Estatus')
                    .items([
                      S.listItem()
                        .title('Pagadas')
                        .child(
                          S.documentList()
                            .title('Ordenes Pagadas')
                            .filter('_type == "order" && status == "pagada"')
                        ),
                      S.listItem()
                        .title('Con Depósito (50%)')
                        .child(
                          S.documentList()
                            .title('Ordenes con Depósito')
                            .filter('_type == "order" && status == "deposito"')
                        ),
                      S.listItem()
                        .title('Terminadas')
                        .child(
                          S.documentList()
                            .title('Ordenes Terminadas')
                            .filter('_type == "order" && status == "terminada"')
                        ),
                      S.listItem()
                        .title('Canceladas')
                        .child(
                          S.documentList()
                            .title('Ordenes Canceladas')
                            .filter('_type == "order" && status == "cancelada"')
                        ),
                    ])
                ),
            ])
        ),
      S.divider(),
      // Filter out 'order' to avoid duplicates, show everything else
      ...S.documentTypeListItems().filter(
        (listItem) => listItem.getId() !== 'order'
      ),
    ])
